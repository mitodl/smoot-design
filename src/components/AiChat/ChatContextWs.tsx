import type { RequestOpts, ChatMessage, CreateMessage } from "./types"
import * as React from "react"
import { useId, useRef, useState } from "react"
import type { AiChatUtils } from "./ChatContext"
import { AiChatContext } from "./ChatContext"

const identity = <T,>(x: T): T => x

type ChatOptions = {
  requestOpts: RequestOpts
  initialMessages: CreateMessage[]
  parseContent?: (content: unknown) => string
}

const useWebSocketChat = ({
  requestOpts,
  initialMessages: initMsgs = [],
  parseContent,
}: ChatOptions): AiChatUtils => {
  const prefix = useId()
  const initialMessages = React.useMemo(() => {
    return initMsgs.map((m, i) => ({ ...m, id: `initial-${prefix}-${i}` }))
  }, [initMsgs, prefix])
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isResponding, setIsResponding] = useState<boolean>(false)
  const wsRef = useRef<WebSocket | null>(null)
  const getWs = () => {
    // Based on https://github.com/facebook/react/issues/14490#issuecomment-454973512
    // to ensure the ws onconnect is attached immediately
    // and no extra sockets are created.
    if (
      wsRef.current?.url !== requestOpts.apiUrl ||
      wsRef.current?.readyState === wsRef.current?.CLOSED
    ) {
      wsRef.current = new WebSocket(requestOpts.apiUrl)
      wsRef.current.addEventListener("message", (e) => {
        setIsLoading(false)
        const text: string = parseContent ? parseContent(e.data) : e.data
        if (text === "!endResponse") {
          setIsResponding(false)
          return
        }
        setIsResponding(true)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + text },
            ]
          } else {
            return [
              ...prev,
              {
                id: `${prefix}-${prev.length}`,
                content: text,
                role: "assistant",
              },
            ]
          }
        })
      })
    }
    return wsRef.current
  }

  const [input, setInput] = useState<string>("")
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value)
  }

  const transformBody = requestOpts.transformBody ?? identity
  const getResponse = async (message: ChatMessage | CreateMessage) => {
    if (isLoading || isResponding) return
    setIsLoading(true)
    const allMessages = [
      ...messages,
      { id: `${prefix}-${messages.length}`, ...message },
    ]
    setMessages(allMessages)
    const ws = getWs()
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(transformBody(allMessages)))
    } else {
      ws.addEventListener("open", () => {
        ws.send(JSON.stringify(transformBody(allMessages)))
      })
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    setInput("")
    getResponse({ content: input, role: "user" })
  }

  return {
    initialMessages,
    messages,
    isLoading,
    isResponding,
    input,
    handleInputChange,
    handleSubmit,
    append: getResponse,
  }
}

const AiChatWsProvider: React.FC<
  ChatOptions & {
    children: React.ReactNode
  }
> = (props) => {
  const value = useWebSocketChat(props)
  return (
    <AiChatContext.Provider value={value}>
      {props.children}
    </AiChatContext.Provider>
  )
}

export { AiChatWsProvider }
