/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { TabButtonList, TabButton, TabButtonLink } from "./TabButtonList"
import type { TabButtonListProps } from "./TabButtonList"
import TabContext from "@mui/lab/TabContext"
import { Button } from "../Button/Button"
import Stack from "@mui/material/Stack"
import TabPanel from "@mui/lab/TabPanel"
import Typography from "@mui/material/Typography"
import { faker } from "@faker-js/faker/locale/en"
import Container from "@mui/material/Container"

type StoryProps = TabButtonListProps & {
  count: number
}

const meta: Meta<StoryProps> = {
  title: "smoot-design/TabButtons",
  argTypes: {
    variant: {
      options: ["scrollable", "fullWidth", "standard"],
      control: { type: "radio" },
    },
    styleVariant: {
      options: ["default", "chat"],
      control: { type: "radio" },
      defaultValue: "default",
    },
    scrollButtons: {
      options: ["auto", true, false],
      control: { type: "radio" },
    },
  },
  args: {
    count: 4,
    variant: "scrollable",
    allowScrollButtonsMobile: true,
    scrollButtons: "auto",
  },
  render: ({ count, ...others }) => {
    const [value, setValue] = React.useState("tab1")
    return (
      <Container maxWidth="sm">
        <TabContext value={value}>
          <Stack direction="row">
            <TabButtonList
              {...others}
              onChange={(_event, val) => setValue(val)}
            >
              {Array(count)
                .fill(null)
                .map((_, i) => (
                  <TabButton
                    key={`tab-${i}`}
                    value={`tab${i + 1}`}
                    label={`Tab ${i + 1}`}
                  />
                ))}
            </TabButtonList>

            <Stack
              direction="row"
              justifyContent="end"
              sx={{ paddingLeft: "16px" }}
            >
              <Button>Other UI</Button>
            </Stack>
          </Stack>
          {Array(count)
            .fill(null)
            .map((_, i) => (
              <TabPanel key={`tab-${i}`} value={`tab${i + 1}`}>
                <Typography variant="h4" component="h4">
                  Header {i + 1}
                </Typography>
                {faker.lorem.paragraphs(2)}
              </TabPanel>
            ))}
        </TabContext>
      </Container>
    )
  },
}

export default meta

type Story = StoryObj<StoryProps>

/**
 * Use `TabButtonList` and `TabButton` to render a list of tabs styled as our tertiary buttons:
 */
export const ButtonTabs: Story = {}

/**
 * `TabButtonList` chat style variant:
 */
export const ButtonTabsChatVariant: Story = {
  args: {
    styleVariant: "chat",
    variant: "fullWidth",
    visibleScrollbar: false,
  },
  render: ({ count, ...others }) => {
    const [value, setValue] = React.useState("tab1")
    return (
      <Container maxWidth="sm">
        <TabContext value={value}>
          <Stack direction="row">
            <TabButtonList
              {...others}
              onChange={(_event, val) => setValue(val)}
            >
              {Array(count)
                .fill(null)
                .map((_, i) => (
                  <TabButton
                    key={`tab-${i}`}
                    value={`tab${i + 1}`}
                    label={`Tab ${i + 1}`}
                  />
                ))}
            </TabButtonList>
          </Stack>
          {Array(count)
            .fill(null)
            .map((_, i) => (
              <TabPanel key={`tab-${i}`} value={`tab${i + 1}`}>
                <Typography variant="h4" component="h4">
                  Header {i + 1}
                </Typography>
                {faker.lorem.paragraphs(2)}
              </TabPanel>
            ))}
        </TabContext>
      </Container>
    )
  },
}

/**
 * By default, the tabs will be scrollable if there are too many to fit in the container:
 */
export const ManyButtonTabs: Story = {
  args: {
    count: 12,
  },
}

/**
 * Use `TabButtonLink` for tabs that should affect the URL:
 */
export const LinkTabs: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/#link2",
      },
    },
  },
  render: () => {
    const [hash, setHash] = useState(() => window.location.hash)

    React.useEffect(() => {
      const handler = () => setHash(window.location.hash)
      window.addEventListener("hashchange", handler)
      return () => {
        window.removeEventListener("hashchange", handler)
      }
    }, [])

    return (
      <div>
        Current Location:
        <pre>{hash}</pre>
        <TabContext value={hash!}>
          <TabButtonList>
            <TabButtonLink value="#link1" href="#link1" label="Tab 1" />
            <TabButtonLink value="#link2" href="#link2" label="Tab 2" />
            <TabButtonLink value="#link3" href="#link3" label="Tab 3" />
          </TabButtonList>
        </TabContext>
      </div>
    )
  },
}
