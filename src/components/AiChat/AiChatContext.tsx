import * as React from "react"
import { useChat, UseChatHelpers } from "@ai-sdk/react"
import type { RequestOpts, AiChatMessage, AiChatContextProps } from "./types"
import { useMemo, createContext } from "react"
import retryingFetch from "../../utils/retryingFetch"
import { getCookie } from "../../utils/getCookie"

const identity = <T,>(x: T): T => x

const getFetcher: (requestOpts: RequestOpts) => typeof fetch =
  (requestOpts: RequestOpts) => async (url, opts) => {
    if (typeof opts?.body !== "string") {
      console.error("Unexpected body type.")
      return retryingFetch(url, opts)
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

    const { csrfCookieName, csrfHeaderName } = requestOpts
    if (csrfCookieName && csrfHeaderName) {
      options.headers = {
        ...options.headers,
        [csrfHeaderName]: getCookie(csrfCookieName) ?? "",
      }
    }
    return retryingFetch(url, options)
  }

/**
 * All of `@ai-sdk/react`'s [`useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
 * results, plus the initial messages.
 */
type AiChatContextResult = UseChatHelpers & {
  initialMessages: AiChatMessage[] | null
}
const AiChatContext = createContext<AiChatContextResult | null>(null)

/**
 * Provides AiChatContext to its children. Within this provider, you can consume
 * the AiChatContext using the `useAiChat` hook.
 */
const AiChatProvider: React.FC<AiChatContextProps> = ({
  initialMessages: _initialMessages,
  requestOpts,
  chatId,
  parseContent,
  children,
}) => {
  const initialMessages = useMemo(() => {
    return (
      _initialMessages?.map((message, i) => ({
        ...message,
        id: `initial-${i}`,
      })) ?? []
    )
  }, [_initialMessages])

  const fetcher = useMemo(() => getFetcher(requestOpts), [requestOpts])
  const { messages: unparsed, ...others } = useChat({
    api: requestOpts.apiUrl,
    streamProtocol: "text",
    fetch: fetcher,
    onFinish: (message) => {
      if (!requestOpts.onFinish) return
      if (message.role === "assistant" || message.role === "user") {
        requestOpts.onFinish?.(message as AiChatMessage)
      } else {
        console.info("Unexpected message role.", message)
      }
    },
    initialMessages,
    id: chatId,
  })

  const messages = useMemo(() => {
    const initial = initialMessages?.map((m) => m.id)
    return unparsed.map((m) => {
      if (m.role === "assistant" && !initial?.includes(m.id)) {
        const content = parseContent ? parseContent(m.content) : m.content
        return { ...m, content }
      }
      return m
    })
  }, [parseContent, unparsed, initialMessages])

  return (
    <AiChatContext.Provider
      /**
       * Ensure that child state is reset when chatId changes.
       */
      key={chatId}
      value={{ initialMessages, messages, ...others }}
    >
      {children}
    </AiChatContext.Provider>
  )
}

/**
 * Returns the AiChatContext, which includes all results from `@ai-sdk/react`'s
 * [`useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) hook as
 * well as the initial messages.
 *
 * In addition to customizing the fetcher, using a context allows us to avoid
 * this issue https://github.com/vercel/ai/issues/3266 since the caller no
 * longer needs to provide the initial messages.
 */
const useAiChat = (): AiChatContextResult => {
  const context = React.useContext(AiChatContext)
  if (!context) {
    throw new Error("useAiChatContext must be used within an AiChatProvider")
  }
  return context
}

export { useAiChat, AiChatProvider }
