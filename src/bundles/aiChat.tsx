import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiChat } from "../components/AiChat/AiChat"
import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider"
import type { AiChatProps } from "../ai"
import { StyleIsolation } from "../components/StyleIsolation/StyleIsolation"

const createAndAppend = () => {
  const newContainer = document.createElement("div")
  document.body.appendChild(newContainer)
  return newContainer
}

type InitOptions = {
  container?: HTMLElement
}

const init = (props: AiChatProps, { container }: InitOptions) => {
  const rootEl = container ?? createAndAppend()
  const root = createRoot(rootEl)
  root.render(
    <ThemeProvider>
      <StyleIsolation>
        <AiChat {...props} />
      </StyleIsolation>
    </ThemeProvider>,
  )
}

export { init }
