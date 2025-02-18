import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiChatDrawer } from "./EdxAiChatDrawer/EdxAiChatDrawer"
import type { AiChatDrawerProps } from "./EdxAiChatDrawer/EdxAiChatDrawer"
import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider"

const edxAiChatDrawer = (opts: AiChatDrawerProps) => {
  const root = document.createElement("div")
  root.id = "smoot-chat-drawer-root"
  document.body.append(root)
  createRoot(root).render(
    <ThemeProvider>
      <AiChatDrawer {...opts} />
    </ThemeProvider>,
  )
}

export { edxAiChatDrawer }
