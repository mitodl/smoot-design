import type { RequestOpts, ChatMessage, CreateMessage } from "./types"
import * as React from "react"
import { useId, useState } from "react"
import { AiChatContext, type AiChatUtils } from "./ChatContext"
import invariant from "tiny-invariant"

const identity = <T,>(x: T): T => x

type ChatOptions = {
  requestOpts: RequestOpts
  initialMessages: CreateMessage[]
  parseContent?: (content: unknown) => string
}

const useHttpChat = ({
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
  const [input, setInput] = useState<string>("")
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value)
  }

  const transformBody = requestOpts.transformBody ?? identity
  const getResponse = async (message: ChatMessage | CreateMessage) => {
    if (isLoading || isResponding) return
    setIsLoading(true)
    const fullMessage: ChatMessage = {
      id: `${prefix}-${messages.length}`,
      ...message,
    }
    const allMessages: ChatMessage[] = [...messages, fullMessage]
    setMessages(allMessages)

    await fetch(requestOpts.apiUrl, {
      method: "POST",
      body: JSON.stringify(transformBody(allMessages)),
      ...requestOpts.fetchOpts,
      headers: {
        "Content-Type": "application/json",
        ...requestOpts.fetchOpts?.headers,
      },
    }).then(async (response) => {
      const reader = response.body?.getReader()
      invariant(reader, "Expected response body to be readable.")
      const textDecoder = new TextDecoder()

      setIsResponding(true)
      const respnseMsg: ChatMessage = {
        id: `${prefix}-${allMessages.length}`,
        content: "",
        role: "assistant",
      }
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          setIsResponding(false)
          setIsLoading(false)
          break
        }

        const chunk = textDecoder.decode(value)

        if (chunk) {
          const parsed = parseContent ? parseContent(chunk) : chunk
          respnseMsg.content += parsed
          setMessages([
            ...allMessages,
            { ...respnseMsg, content: respnseMsg.content },
          ])
        }
      }
    })
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

const AiChatHttpProvider: React.FC<
  ChatOptions & {
    children: React.ReactNode
  }
> = (props) => {
  const value = useHttpChat(props)
  return (
    <AiChatContext.Provider value={value}>
      {props.children}
    </AiChatContext.Provider>
  )
}

export { AiChatHttpProvider }
