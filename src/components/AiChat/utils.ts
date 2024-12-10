import { useChat, UseChatOptions } from "ai/react"
import type { RequestOpts, ChatMessage } from "./types"
import { useMemo } from "react"

const identity = <T>(x: T): T => x

const getFetcher: (requestOpts: RequestOpts) => typeof fetch =
  (requestOpts: RequestOpts) => async (url, opts) => {
    if (typeof opts?.body !== "string") {
      console.error("Unexpected body type.")
      return window.fetch(url, opts)
    }
    const messages: ChatMessage[] = JSON.parse(opts?.body).messages
    const transformMessages: RequestOpts["transformMessages"] =
      requestOpts.transformMessages ?? identity
    const options: RequestInit = {
      ...opts,
      body: JSON.stringify(transformMessages(messages)),
      headers: {
        ...opts?.headers,
        "Content-Type": "application/json",
        ...requestOpts.headersOpts,
      },
      ...requestOpts.fetchOpts,
    }
    return fetch(url, options)
  }

const useAiChat = (requestOpts: RequestOpts, opts: UseChatOptions) => {
  const fetcher = useMemo(() => getFetcher(requestOpts), [requestOpts])
  return useChat({
    api: requestOpts.apiUrl,
    streamProtocol: "text",
    fetch: fetcher,
    ...opts,
  })
}

export { useAiChat }
