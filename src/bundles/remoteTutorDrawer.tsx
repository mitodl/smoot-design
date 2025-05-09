import * as React from "react"
import { createRoot } from "react-dom/client"
import { RemoteTutorDrawer } from "./RemoteTutorDrawer/RemoteTutorDrawer"
import type { RemoteTutorDrawerProps } from "./RemoteTutorDrawer/RemoteTutorDrawer"
import {
  ThemeProvider,
  createTheme,
} from "../components/ThemeProvider/ThemeProvider"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"
import { MathJaxContext } from "better-react-mathjax"

/**
 * Renders the RemoteTutorDrawer in an shadow DOM in order to isolate the drawer
 * styles from external stylesheets.
 */
const init = (opts: RemoteTutorDrawerProps) => {
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
        <MathJaxContext>
          <RemoteTutorDrawer {...opts} />
        </MathJaxContext>
        ,
      </ThemeProvider>
    </CacheProvider>,
  )

  // Ensure mathjax context menu is rendered above the drawer
  // NOTE: must be done in regular DOM, not hte shadowdom.
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
