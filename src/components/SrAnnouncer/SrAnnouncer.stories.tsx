import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { SrAnnouncer } from "./SrAnnouncer"
import { styled } from "@mui/material/styles"

const Container = styled("div")<{ forceVisible?: boolean }>(
  ({ forceVisible }) => [
    forceVisible && {
      width: "100% !important",
      height: "100px !important",
      "& > *:first-of-type": {
        width: "unset !important",
        height: "unset !important",
        clipPath: "none !important",
        clip: "unset !important",
        position: "unset !important" as "unset",
      },
    },
  ],
)

const meta: Meta<typeof SrAnnouncer> = {
  title: "smoot-design/ScreenreaderAnnouncer",
  component: SrAnnouncer,
  decorators: function Decorator(Story) {
    const [forceVisible, setForceVisible] = React.useState(true)
    return (
      <>
        <label>
          Force Visible:
          <input
            type="checkbox"
            checked={forceVisible}
            onChange={(e) => setForceVisible(e.target.checked)}
          />
          <p>By default, the content of this story is visually hidden.</p>
        </label>
        <hr />
        <Container forceVisible={forceVisible}>
          <Story />
        </Container>
      </>
    )
  },
  args: {
    message: "A message to read to user",
    isLoading: true,
    loadingMessages: [
      { delay: 1000, text: "Loading" },
      { delay: 3000, text: "Still loading" },
    ],
  },
}

export default meta

type Story = StoryObj<typeof SrAnnouncer>

export const ScreenreaderAnnouncements: Story = {}
