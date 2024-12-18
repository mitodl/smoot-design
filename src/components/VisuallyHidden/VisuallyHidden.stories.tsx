import type { Meta, StoryObj } from "@storybook/react"
import { VisuallyHidden } from "./VisuallyHidden"

const meta: Meta<typeof VisuallyHidden> = {
  title: "smoot-design/VisuallyHidden",
  component: VisuallyHidden,
  args: {
    children: "Not visible, but screen readers can still read this text.",
  },
}

export default meta

type Story = StoryObj<typeof VisuallyHidden>

export const ScreenreaderOnly: Story = {}
