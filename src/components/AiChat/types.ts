// Some of these are based on (compatible, but simplfied / restricted) versions of ai/react types.

type Role = "assistant" | "user"
type ChatMessage = {
  id: string
  content: string
  role: Role
}

type RequestOpts = {
  apiUrl: string
  /**
   * Transforms array of chat messages into request body. Messages
   * are ordered oldest to newest.
   *
   * JSON.stringify is applied to the return value.
   */
  transformBody?: (messages: ChatMessage[]) => unknown
  /**
   * Extra options to pass to fetch.
   *
   * If headers are specified, they will override the headersOpts.
   */
  fetchOpts?: RequestInit
  /**
   * Extra headers to pass to fetch.
   */
  headersOpts?: HeadersInit
}

type AiChatProps = {
  className?: string
  initialMessages: Omit<ChatMessage, "id">[]
  conversationStarters?: { content: string }[]
  requestOpts: RequestOpts
  parseContent?: (content: unknown) => string
}

export type { RequestOpts, AiChatProps, ChatMessage }
