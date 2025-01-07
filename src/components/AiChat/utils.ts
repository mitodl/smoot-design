import type { RequestOpts, ChatMessage, CreateMessage } from "./types"
import { useId, useState } from "react"
import invariant from "tiny-invariant"

const identity = <T>(x: T): T => x

const useHttpChat = (
  requestOpts: RequestOpts,
  opts: {
    initialMessages: ChatMessage[]
  } = {
    initialMessages: [],
  },
) => {
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
        ...requestOpts.headersOpts,
      },
      body: JSON.stringify(transformBody(allMessages)),
      ...requestOpts.fetchOpts,
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

export { useHttpChat }
