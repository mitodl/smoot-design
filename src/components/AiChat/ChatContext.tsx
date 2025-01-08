import * as React from "react"
import type { ChatMessage, CreateMessage } from "./types"

type AiChatUtils = {
  initialMessages: ChatMessage[]
  messages: ChatMessage[]
  isLoading: boolean
  isResponding: boolean
  input: string
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>
  handleSubmit: React.FormEventHandler<HTMLFormElement>
  append: (message: ChatMessage | CreateMessage) => Promise<void>
}

const AiChatContext = React.createContext<AiChatUtils | undefined>(undefined)

const useAiChatContext = (): AiChatUtils => {
  const context = React.useContext(AiChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}

export { AiChatContext, useAiChatContext }
export type { AiChatUtils }
