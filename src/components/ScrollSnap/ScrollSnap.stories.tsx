import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ScrollSnap } from "./ScrollSnap"
import styled from "@emotion/styled"
import { faker } from "@faker-js/faker/locale/en"
import { useInterval } from "@/utils/useInterval"
import Slider from "@mui/material/Slider"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { Button } from "../Button/Button"

const Scroller = styled(ScrollSnap)({
  width: "200px",
  height: "350px",
  border: "1pt solid black",
})

const meta: Meta<typeof ScrollSnap> = {
  title: "smoot-design/ScrollSnap",
  component: ScrollSnap,
  render: function Render(args) {
    const MAX = 3000
    const [updateInterval, setUpdateInterval] = React.useState(MAX)
    const [children, setChildren] = React.useState(faker.lorem.sentence())
    const appendText = () =>
      setChildren((current) => {
        return `${current} ${faker.lorem.sentence()}`
      })
    useInterval(
      () => {
        appendText()
      },
      updateInterval === MAX ? null : updateInterval,
    )
    return (
      <Stack gap="12px" alignItems="start">
        <Typography>Update interval (ms)</Typography>
        <Slider
          sx={{ width: "350px" }}
          marks={[
            { value: 100, label: "0.1s" },
            { value: 2000, label: "2s" },
            { value: MAX, label: "off" },
          ]}
          value={updateInterval}
          min={100}
          max={MAX}
          onChange={(_e, val) => setUpdateInterval(val as number)}
        />
        <Scroller {...args}>{children}</Scroller>
        <Button onClick={appendText}>Append Sentence</Button>
      </Stack>
    )
  },
}

export default meta

type Story = StoryObj<typeof ScrollSnap>

export const Chat: Story = {}
