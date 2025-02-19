import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiChatDrawer } from "./RemoteAiChatDrawer/RemoteAiChatDrawer"
import type { AiChatDrawerProps } from "./RemoteAiChatDrawer/RemoteAiChatDrawer"
import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider"

const init = (opts: AiChatDrawerProps) => {
  const root = document.createElement("div")
  root.id = "smoot-chat-drawer-root"
  document.body.append(root)
  createRoot(root).render(
    <ThemeProvider>
      <AiChatDrawer {...opts} />
    </ThemeProvider>,
  )
}

export { init }
