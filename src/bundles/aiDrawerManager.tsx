import * as React from "react"
import { createRoot } from "react-dom/client"
import { AiDrawerManager } from "./AiDrawer/AiDrawerManager"
import type { AiDrawerManagerProps } from "./AiDrawer/AiDrawerManager"
import {
  ThemeProvider,
  createTheme,
} from "../components/ThemeProvider/ThemeProvider"
import { StyleIsolation } from "../components/StyleIsolation/StyleIsolation"

type InitOptions = {
  container?: HTMLElement
}

type InitReturn = {
  unmount: () => void
  container: HTMLElement
}

export type { InitOptions, InitReturn }

const safeRemoveElement = (element: HTMLElement | null | undefined): void => {
  if (!element?.parentNode) {
    return
  }

  try {
    element.parentNode.removeChild(element)
  } catch {
    // Swallow removal errors; element/parent may already be gone in host DOM
  }
}

const init = (
  opts: AiDrawerManagerProps,
  initOpts?: InitOptions,
): InitReturn => {
  const providedContainer = initOpts?.container
  const isSlotVariant = opts.variant === "slot"
  if (isSlotVariant && !providedContainer) {
    throw new Error(
      'Container is required for "slot" variant. Provide container in initOpts.',
    )
  }

  const containerCreatedByInit = !providedContainer
  let reactContainer: HTMLElement, container: HTMLElement

  if (!providedContainer) {
    container = document.createElement("div")
    reactContainer = container
    document.body.appendChild(container)
  } else {
    container = providedContainer
    reactContainer = document.createElement("div")
    reactContainer.style.width = "100%"
    // Height controlled by parent container
    container.appendChild(reactContainer)
  }

  if (!container.id) {
    container.id = "smoot-chat-drawer-root"
  }

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
        defaultProps: {
          container: () => isolationRoot.element || reactContainer,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: () => isolationRoot.element || reactContainer,
        },
      },
      MuiModal: {
        defaultProps: {
          container: () => isolationRoot.element || reactContainer,
        },
      },
    },
  })

  const isolationRootRef = (element: HTMLDivElement | null) => {
    isolationRoot.element = element
  }

  const root = createRoot(reactContainer)
  root.render(
    <StyleIsolation ref={isolationRootRef}>
      <ThemeProvider theme={theme}>
        <AiDrawerManager {...opts} />
      </ThemeProvider>
    </StyleIsolation>,
  )

  const style = document.createElement("style")
  style.textContent = `
    .CtxtMenu_MenuFrame {
      z-index: ${theme.zIndex.drawer + 100} !important;
    }
  `
  document.head.appendChild(style)

  return {
    unmount: () => {
      try {
        root.unmount()
      } catch {
        // Swallow unmount errors; root may already have been torn down
      }

      try {
        if (reactContainer !== container) {
          safeRemoveElement(reactContainer)
        }

        if (containerCreatedByInit) {
          safeRemoveElement(container)
        }

        safeRemoveElement(style)
      } catch {
        // Swallow cleanup errors so calling code can safely invoke unmount()
      }
    },
    container,
  }
}

export { init }
