import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiChat } from "../ai"
import type { AiChatProps } from "../ai"
import { ThemeProvider } from "../index"

type CreateChatOptions = {
  root: HTMLElement
} & AiChatProps

const aiChat = (opts: CreateChatOptions) => {
  const root = opts.root
  createRoot(root).render(
    <ThemeProvider>
      <AiChat {...opts} />
    </ThemeProvider>,
  )
}

export { aiChat }
