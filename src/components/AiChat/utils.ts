import { useEffect, useState, useMemo } from "react"
import { useChat, UseChatOptions } from "@ai-sdk/react"
import type { Message } from "@ai-sdk/react"
import type { RequestOpts, AiChatMessage } from "./types"

const identity = <T>(x: T): T => x

const getFetcher: (
  requestOpts: RequestOpts,
  additionalBody?: Record<string, string>,
) => typeof fetch =
  (requestOpts: RequestOpts, additionalBody: Record<string, string> = {}) =>
  async (url, opts) => {
    if (typeof opts?.body !== "string") {
      console.error("Unexpected body type.")
      return window.fetch(url, opts)
    }
    const messages: AiChatMessage[] = JSON.parse(opts?.body).messages
    const transformBody: RequestOpts["transformBody"] =
      requestOpts.transformBody ?? identity
    const options: RequestInit = {
      ...opts,
      body: JSON.stringify(transformBody(messages, additionalBody)),
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

const useFetch = <T>(url: string | undefined) => {
  const [response, setResponse] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(url)
        const result = await response.json()
        setResponse(result)
      } catch (error) {
        console.error("Error fetching data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { response, loading }
}

/**
 * Extracts comments from content and parses any that contain valid JSON.
 */
const extractCommentsData = (content: string): AiChatMessage["data"] => {
  const commentRegex = /<!--\s*(.*?)\s*-->/g
  const comments: string[] = []
  let data = {}

  let match
  while ((match = commentRegex.exec(content)) !== null) {
    comments.push(match[1].trim())
  }

  for (const comment of comments) {
    try {
      const parsed = JSON.parse(comment)
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        data = {
          ...data,
          ...parsed,
        }
      }
    } catch {
      continue
    }
  }

  return data
}

export { useAiChat, useFetch, extractCommentsData }
