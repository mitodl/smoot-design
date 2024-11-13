import * as React from "react"
import { Preview } from "@storybook/react"
import { ThemeProvider } from "../src/components/ThemeProvider/ThemeProvider"

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
