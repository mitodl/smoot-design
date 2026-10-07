import * as React from "react"
import { createRoot } from "react-dom/client"
import { ContactUsLauncher } from "./ContactUsLauncher/ContactUsLauncher"
import type { ContactUsLauncherProps } from "./ContactUsLauncher/ContactUsLauncher"
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

type ContactUsLauncherInitOpts = ContactUsLauncherProps & {
  translations?: TranslationsInput | null
}

type InitReturn = {
  unmount: () => void
  container: HTMLElement
}

export type { InitOptions, InitReturn, ContactUsLauncherInitOpts }

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
  opts: ContactUsLauncherInitOpts,
  initOpts?: InitOptions,
): InitReturn => {
  const { translations, ...launcherProps } = opts

  const providedContainer = initOpts?.container
  const containerCreatedByInit = !providedContainer
  let reactContainer: HTMLElement, container: HTMLElement

  if (!providedContainer) {
    container = document.createElement("div")
    reactContainer = container
    document.body.appendChild(container)
  } else {
    // React clears the container it renders into on first commit, so never
    // render straight into the host's element.
    container = providedContainer
    reactContainer = document.createElement("div")
    container.appendChild(reactContainer)
  }

  // Only ours to name. Stamping this on a host's element hijacks their
  // getElementById, and two launchers in two host divs would share one id.
  if (containerCreatedByInit && !container.id) {
    container.id = "smoot-contact-us-root"
  }

  // MUI's Drawer portals out of the StyleIsolation subtree, which breaks the
  // DOM-hierarchy selectors increaseSpecificity emits. Point the portal back
  // inside the isolation root so those selectors match. See aiDrawerManager.
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
        <TranslationProvider translations={translations ?? null}>
          <ContactUsLauncher {...launcherProps} />
        </TranslationProvider>
      </ThemeProvider>
    </StyleIsolation>,
  )

  return {
    unmount: () => {
      try {
        root.unmount()
      } catch {
        // Swallow unmount errors; root may already have been torn down
      }

      if (reactContainer !== container) {
        safeRemoveElement(reactContainer)
      }

      if (containerCreatedByInit) {
        safeRemoveElement(container)
      }
    },
    container,
  }
}

export { init }
