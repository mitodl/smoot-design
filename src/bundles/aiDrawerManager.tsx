import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiDrawerManager } from "./AiDrawer/AiDrawerManager"
import type { AiDrawerManagerProps } from "./AiDrawer/AiDrawerManager"
import {
  ThemeProvider,
  createTheme,
} from "../components/ThemeProvider/ThemeProvider"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"

/**
 * Renders the AiDrawerManager to the page.
 */
const init = (opts: AiDrawerManagerProps) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  container.id = "smoot-chat-drawer-root"

  const cache = createCache({
    key: "css",
    prepend: true,
    container: container,
  })
  const theme = createTheme({
    components: {
      MuiPopover: { defaultProps: { container: container } },
      MuiPopper: { defaultProps: { container: container } },
      MuiModal: { defaultProps: { container: container } },
    },
  })
  createRoot(container).render(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <AiDrawerManager {...opts} />
      </ThemeProvider>
    </CacheProvider>,
  )

  // Ensure mathjax context menu is rendered above the drawer
  // Mathjax context menu is appended to end of body.
  const style = document.createElement("style")
  style.textContent = `
    .CtxtMenu_MenuFrame {
      z-index: ${theme.zIndex.drawer + 100} !important;
    }
  `
  document.head.appendChild(style)
}

export { init }
