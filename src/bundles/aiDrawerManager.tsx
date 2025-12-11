import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiDrawerManager } from "./AiDrawer/AiDrawerManager"
import type { AiDrawerManagerProps } from "./AiDrawer/AiDrawerManager"
import {
  ThemeProvider,
  createTheme,
} from "../components/ThemeProvider/ThemeProvider"
import { StyleIsolation } from "../components/StyleIsolation/StyleIsolation"

/**
 * Renders the AiDrawerManager to the page.
 */
const init = (opts: AiDrawerManagerProps) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  container.id = "smoot-chat-drawer-root"

  /* MUI's Drawer renders via a portal (React's createPortal() API), so its content isn't a DOM
   * descendant of StyleIsolationRoot. The increaseSpecificity plugin relies on DOM hierarchy,
   * so those selectors don't match portaled content. The Emotion cache from CacheProvider still
   * works (React context), but the CSS class-based selectors fail.
   *
   * Store the StyleIsolation root element in an object so the portal container function
   * can access the current value. This ensures portaled Drawer content is rendered
   * within the StyleIsolation DOM tree, so CSS specificity selectors work correctly.
   */
  const isolationRoot = { element: null as HTMLElement | null }

  const theme = createTheme({
    components: {
      MuiPopover: {
        defaultProps: { container: () => isolationRoot.element || container },
      },
      MuiPopper: {
        defaultProps: { container: () => isolationRoot.element || container },
      },
      MuiModal: {
        defaultProps: { container: () => isolationRoot.element || container },
      },
    },
  })

  const isolationRootRef = (element: HTMLDivElement | null) => {
    isolationRoot.element = element
  }

  createRoot(container).render(
    <StyleIsolation ref={isolationRootRef}>
      <ThemeProvider theme={theme}>
        <AiDrawerManager {...opts} />
      </ThemeProvider>
    </StyleIsolation>,
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
