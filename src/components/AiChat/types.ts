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
  onFinish?: (message: ChatMessage) => void
}

type AiChatProps = {
  chatId?: string
  /**
   * If provided, renders a title bar.
   */
  title?: string
  /**
   * Fired when "Close" button within title bar is clicked.
   */
  onClose?: () => void
  className?: string
  initialMessages: Omit<ChatMessage, "id">[]
  conversationStarters?: { content: string }[]
  requestOpts: RequestOpts
  parseContent?: (content: unknown) => string
  /**
   * A message to display while the component is in a loading state.
   *
   * Identical consecutive messages may not be read on some screen readers.
   */
  srLoadingMessages?: {
    delay: number
    text: string
  }[]
  /**
   * If provided, element to use for rendering avatar images.
   * By default, the theme's ImageAdater is used.
   */
  ImgComponent?: React.ElementType
}

export type { RequestOpts, AiChatProps, ChatMessage }
