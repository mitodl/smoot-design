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

  const cache = createCache({
    key: "css",
    prepend: true,
    container: reactContainer,
  })
  const theme = createTheme({
    components: {
      MuiPopover: { defaultProps: { container: reactContainer } },
      MuiPopper: { defaultProps: { container: reactContainer } },
      MuiModal: { defaultProps: { container: reactContainer } },
    },
  })
  const root = createRoot(reactContainer)
  root.render(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <AiDrawerManager {...opts} />
      </ThemeProvider>
    </CacheProvider>,
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
