import * as React from "react"
import { Preview } from "@storybook/react"
import { ThemeProvider } from "../src/components/ThemeProvider/ThemeProvider"
import { initialize, mswLoader } from "msw-storybook-addon"

const ALLOW_UNHANDLED_REQUESTS = [/use\.typekit/]
// Initialize MSW
initialize({
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
