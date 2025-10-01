// Some of these are based on (compatible, but simplified / restricted) versions of @ai-sdk/react types.

import { RefAttributes } from "react"
import type { MathJax3Config } from "better-react-mathjax"

type Role = "assistant" | "user" | "data" | "system"

type MessageData = {
  checkpoint_pk?: string
  thread_id?: string
}

type AiChatMessage = {
  id: string
  content: string
  role: Role
  data?: MessageData
}

type RequestOpts = {
  apiUrl: string
  /**
   * Transforms array of chat messages into request body. Messages
   * are ordered oldest to newest.
   *
   * JSON.stringify is applied to the return value.
   */

  /**
   * URL for the like/dislike feedback endpoint.
   *
   * The URL should include the following substitution strings:
   * - :threadId
   * - :checkpointPk
   * e.g. "http://localhost:4567/feedback/:threadId/:checkpointPk"
   *
   * If not provided, provided, defaults to the apiUrl origin + "/api/v0/chat_sessions/{thread_id}/messages/{checkpoint_pk}/rate/"
   */
  feedbackApiUrl?: string

  transformBody?: (
    messages: AiChatMessage[],
    body?: Record<string, string>,
  ) => unknown
  /**
   * Extra options to pass to fetch.
   */
  fetchOpts?: RequestInit
  onFinish?: (message: AiChatMessage) => void
  /**
   * Cookie name from which to read CSRF token.
   */
  csrfCookieName?: string
  /**
   * Header name to which to write CSRF token.
   */
  csrfHeaderName?: string
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

  additionalBody?: Record<string, string>
  setAdditionalBody?: (body: Record<string, string>) => void
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
   * If true, the chat will display math equations using MathJax..
   * Defaults to false.
   */
  useMathJax?: boolean

  /**
   * Overrides the default MathJax configuration.
   */
  mathJaxConfig?: MathJax3Config

  /**
   * If true, the chat input will be autofocused on load.
   * Defaults to true.
   */
  autofocus?: boolean

  /**
   * URL to fetch problem set list for dropdown.
   *
   * The problem set selection is passed as the second argument to the `transformBody` function
   * provided as `{ problem_set_title: string }`.
   */
  problemSetListUrl?: string

  /**
   * Initial messages to display on problem set selection.
   * Occurrences of "<title>" in the content will be replaced with the problem set title.
   */
  problemSetInitialMessages?: Omit<AiChatMessage, "id">[]

  /**
   * Initial messages to display on problem set selection if no problem sets are available.
   */
  problemSetEmptyMessages?: Omit<AiChatMessage, "id">[]

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
