import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiChat } from "../components/AiChat/AiChat"
import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider"
import type { AiChatProps } from "../ai"
import styled from "@emotion/styled"

const createAndAppend = () => {
  const newContainer = document.createElement("div")
  document.body.appendChild(newContainer)
  return newContainer
}

type InitOptions = {
  container?: HTMLElement
}

const StyledAiChat = styled(AiChat)({
  /**
   * Unset some openedx styles that conflict with our chat styling.
   * There are probably other conflicts not handled here.
   */
  "& input[type=text]:focus": {
    border: "unset",
    boxShadow: "unset",
  },
})

const init = (props: AiChatProps, { container }: InitOptions) => {
  const rootEl = container ?? createAndAppend()
  const root = createRoot(rootEl)
  root.render(
    <ThemeProvider>
      <StyledAiChat {...props} />
    </ThemeProvider>,
  )
}

export { init }
