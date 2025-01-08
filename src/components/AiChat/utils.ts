import type { RequestOpts, ChatMessage, CreateMessage } from "./types"
import { useId, useRef, useState } from "react"
import invariant from "tiny-invariant"

const identity = <T>(x: T): T => x

type ChatContext = {
  messages: ChatMessage[]
  isLoading: boolean
  isResponding: boolean
  input: string
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>
  handleSubmit: React.FormEventHandler<HTMLFormElement>
  append: (message: ChatMessage | CreateMessage) => Promise<void>
}

const useHttpChat = (
  requestOpts: RequestOpts,
  opts: {
    initialMessages: ChatMessage[]
  } = {
    initialMessages: [],
  },
): ChatContext => {
  const prefix = useId()
  const [messages, setMessages] = useState<ChatMessage[]>(opts.initialMessages)
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
      headers: {
        "Content-Type": "application/json",
        ...requestOpts.fetchOpts?.headers,
      },
      body: JSON.stringify(transformBody(allMessages)),
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
          respnseMsg.content += chunk
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
    messages,
    isLoading,
    isResponding,
    input,
    handleInputChange,
    handleSubmit,
    append: getResponse,
  }
}

const useWebSocketChat = (
  requestOpts: RequestOpts,
  opts: {
    initialMessages: ChatMessage[]
  } = {
    initialMessages: [],
  },
): ChatContext => {
  const prefix = useId()
  const [messages, setMessages] = useState<ChatMessage[]>(opts.initialMessages)
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
      wsRef.current.onmessage = (event) => {
        setIsLoading(false)
        const text: string = event.data
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
      }
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
    messages,
    isLoading,
    isResponding,
    input,
    handleInputChange,
    handleSubmit,
    append: getResponse,
  }
}

export { useHttpChat, useWebSocketChat }
