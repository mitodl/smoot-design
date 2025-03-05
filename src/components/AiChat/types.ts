// Some of these are based on (compatible, but simplfied / restricted) versions of ai/react types.

type Role = "assistant" | "user"
type AiChatMessage = {
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
  transformBody?: (messages: AiChatMessage[]) => unknown
  /**
   * Extra options to pass to fetch.
   */
  fetchOpts?: RequestInit
  onFinish?: (message: AiChatMessage) => void
}

type AiChatProps = {
  /**
   * Changing the `chatId` will reset the chat. Changing the `chatId` to a
   * previously used value will restore the session state.
   */
  chatId?: string
  /**
   * If provided, renders a title bar.
   */
  title?: string
  /**
   * If provided, renders the "AskTIM" title motif followed by the text.
   */
  askTimTitle?: string
  /**
   * Placeholder message for chat input
   */
  placeholder?: string
  /**
   * Sends an initial user prompt on first load
   */

  onClose?: () => void
  className?: string
  initialMessages: Omit<AiChatMessage, "id">[]
  conversationStarters?: { content: string }[]
  /**
   * Options for making requests to the AI service.
   */
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

  /**
   * Where the scroll container is provided by the component,
   * the AiChat will scroll to the bottom when a prompt is submitted.
   */
  scrollContainer?: HTMLElement

  /**
   * Provide a ref to the chat component to access the `append` method.
   */
  ref?: React.Ref<{
    append: (message: Omit<AiChatMessage, "id">) => void
  }>
}
export type { RequestOpts, AiChatProps, AiChatMessage }
