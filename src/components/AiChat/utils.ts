import { useChat, UseChatOptions } from "ai/react"
import type { Message } from "ai/react"
import type { RequestOpts, AiChatMessage } from "./types"
import { useMemo } from "react"

const identity = <T>(x: T): T => x

const getFetcher: (requestOpts: RequestOpts) => typeof fetch =
  (requestOpts: RequestOpts) => async (url, opts) => {
    if (typeof opts?.body !== "string") {
      console.error("Unexpected body type.")
      return window.fetch(url, opts)
    }
    const messages: AiChatMessage[] = JSON.parse(opts?.body).messages
    const transformBody: RequestOpts["transformBody"] =
      requestOpts.transformBody ?? identity
    const options: RequestInit = {
      ...opts,
      body: JSON.stringify(transformBody(messages)),
      ...requestOpts.fetchOpts,
      headers: {
        ...opts?.headers,
        "Content-Type": "application/json",
        ...requestOpts.fetchOpts?.headers,
      },
    }
    return fetch(url, options)
  }

const useAiChat = (requestOpts: RequestOpts, opts: UseChatOptions) => {
  const fetcher = useMemo(() => getFetcher(requestOpts), [requestOpts])
  return useChat({
    api: requestOpts.apiUrl,
    streamProtocol: "text",
    fetch: fetcher,
    onFinish: (message: Message) => {
      if (!requestOpts.onFinish) return
      if (message.role === "assistant" || message.role === "user") {
        requestOpts.onFinish?.(message as AiChatMessage)
      } else {
        console.info("Unexpected message role.", message)
      }
    },
    ...opts,
  })
}

export { useAiChat }
