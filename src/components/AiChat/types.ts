// Some of these are based on (compatible, but simplified / restricted) versions of @ai-sdk/react types.

import { RefAttributes } from "react"

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

type AiChatContextProps = {
  /**
   * Changing the `chatId` will reset the chat. Changing the `chatId` to a
   * previously used value will restore the session state.
   */
  chatId?: string
  /**
   * Options for making requests to the AI service.
   */
  requestOpts: RequestOpts

  parseContent?: (content: unknown) => string
  /**
   * Initial messages to display on the chat. If not provided, the entry screen title will be used as the initial message.
   */
  initialMessages?: Omit<AiChatMessage, "id">[]

  children?: React.ReactNode
}

type AiChatDisplayProps = {
  /**
   * If provided, renders the "AskTIM" title motif followed by the text.
   */
  askTimTitle?: string

  /**
   * Placeholder message for chat input.
   */
  placeholder?: string

  className?: string

  /**
   * Set to false to disable the entry screen and load the chat immediately.
   * Defaults to true.
   */
  entryScreenEnabled?: boolean

  /**
   * Title to display on the entry screen, also the initial assistant message if not overridden by `initialMessages`.
   */
  entryScreenTitle?: string

  /**
   * Prompt suggestions for the user, clickable on the entry screen or in the chat if the entry screen is not enabled.
   */
  conversationStarters?: { content: string }[]

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
   * the AiChat will scroll to the bottom as chat messages are added.
   */
  scrollElement?: HTMLElement | null

  /**
   * If true, the chat will display math equations using MathJax.
   * Defaults to false.
   */
  useMathJax?: boolean
  /**
   * If true, the chat input will be autofocused on load.
   * Defaults to true.
   */
  autofocus?: boolean

  onSubmit?: (
    messageText: string,
    meta: {
      source: "input" | "conversation-starter"
    },
  ) => void
} & RefAttributes<HTMLDivElement>

type AiChatProps = AiChatContextProps & AiChatDisplayProps

export type {
  RequestOpts,
  AiChatMessage,
  AiChatContextProps,
  AiChatDisplayProps,
  AiChatProps,
}
