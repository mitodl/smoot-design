import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiChatDrawer } from "./RemoteAiChatDrawer/RemoteAiChatDrawer"
import type { AiChatDrawerProps } from "./RemoteAiChatDrawer/RemoteAiChatDrawer"
import {
  ThemeProvider,
  createTheme,
} from "../components/ThemeProvider/ThemeProvider"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"

/**
 * Renders the AiChatDrawer in an shadow DOM in order to isolate the drawer
 * styles from external stylesheets.
 */
const init = (opts: AiChatDrawerProps) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const shadowContainer = container.attachShadow({ mode: "open" })
  const shadowRootEl = document.createElement("div")
  shadowRootEl.id = "smoot-chat-drawer-root"
  shadowContainer.append(shadowRootEl)
  // See https://mui.com/material-ui/customization/shadow-dom/
  // Ensure style tags are rendered in shadow root
  const cache = createCache({
    key: "css",
    prepend: true,
    container: shadowContainer,
  })
  const theme = createTheme({
    components: {
      // Ensure modals, etc, are rendered in shadow root
      MuiPopover: { defaultProps: { container: shadowRootEl } },
      MuiPopper: { defaultProps: { container: shadowRootEl } },
      MuiModal: { defaultProps: { container: shadowRootEl } },
    },
  })
  createRoot(shadowRootEl).render(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <AiChatDrawer {...opts} />
      </ThemeProvider>
    </CacheProvider>,
  )
}

export { init }
