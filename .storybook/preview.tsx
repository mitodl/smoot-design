import * as React from "react"
import { Preview } from "@storybook/react"
import { ThemeProvider } from "../src/components/ThemeProvider/ThemeProvider"
import { initialize, mswLoader } from "msw-storybook-addon"

const ALLOW_UNHANDLED_REQUESTS = [/use\.typekit/]
// Initialize MSW
initialize({
  serviceWorker: {
    /**
     * The default service worker location is `/mockServiceWorker.js`.,
     * i.e., located at root.
     *
     * This doesn't work well for hosting in a subdirectory, e.g., github pages.
     *
     * Using a relative URL works fine since storybook is a SPA
     * with msw adjacent to the index file.
     */
    url: "mockServiceWorker.js",
  },
  onUnhandledRequest(request, print) {
    if (ALLOW_UNHANDLED_REQUESTS.some((regex) => regex.test(request.url))) {
      return
    }
    print.warning()
  },
})

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
  loaders: [mswLoader],
}

export default preview
