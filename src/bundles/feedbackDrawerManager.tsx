import * as React from "react"
import { createRoot } from "react-dom/client"
import { FeedbackDrawerManager } from "./FeedbackDrawer/FeedbackDrawerManager"
import type { FeedbackDrawerManagerProps } from "./FeedbackDrawer/FeedbackDrawerManager"
import {
  ThemeProvider,
  createTheme,
} from "../components/ThemeProvider/ThemeProvider"
import { StyleIsolation } from "../components/StyleIsolation/StyleIsolation"
import { TranslationProvider } from "../contexts/TranslationContext"
import type { TranslationsInput } from "../contexts/TranslationContext"

type InitOptions = {
  container?: HTMLElement
}

/**
 * Message-driven feedback drawer: the in-iframe megaphone posts an open message
 * and the drawer renders as an overlay (`variant: "drawer"`) or inline in a
 * host container (`variant: "slot"`).
 */
type FeedbackDrawerManagerInitOpts = FeedbackDrawerManagerProps & {
  translations?: TranslationsInput | null
}

type InitReturn = {
  unmount: () => void
  container: HTMLElement
}

export type { InitOptions, InitReturn, FeedbackDrawerManagerInitOpts }

const safeRemoveElement = (element: HTMLElement | null | undefined): void => {
  if (!element?.parentNode) {
    return
  }
  try {
    element.parentNode.removeChild(element)
  } catch {
    // element/parent may already be gone in host DOM
  }
}

const init = (
  opts: FeedbackDrawerManagerInitOpts,
  initOpts?: InitOptions,
): InitReturn => {
  const translations = opts.translations ?? null

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
    container.appendChild(reactContainer)
  }

  // Only stamp an id on containers we created; never mutate a caller-provided
  // (slot) container's id.
  if (containerCreatedByInit && !container.id) {
    container.id = "smoot-feedback-drawer-root"
  }

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

  const { translations: _t, ...managerProps } = opts
  const appNode = (
    <FeedbackDrawerManager {...(managerProps as FeedbackDrawerManagerProps)} />
  )

  const root = createRoot(reactContainer)
  root.render(
    <StyleIsolation ref={isolationRootRef}>
      <ThemeProvider theme={theme}>
        <TranslationProvider translations={translations}>
          {appNode}
        </TranslationProvider>
      </ThemeProvider>
    </StyleIsolation>,
  )

  return {
    unmount: () => {
      try {
        root.unmount()
      } catch {
        // root may already have been torn down
      }
      try {
        if (reactContainer !== container) {
          safeRemoveElement(reactContainer)
        }
        if (containerCreatedByInit) {
          safeRemoveElement(container)
        }
      } catch {
        // swallow cleanup errors
      }
    },
    container,
  }
}

export { init }
