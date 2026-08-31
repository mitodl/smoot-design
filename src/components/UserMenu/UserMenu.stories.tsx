import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import Stack from "@mui/material/Stack"
import { UserMenu } from "./UserMenu"
import type { UserMenuItem } from "./UserMenu"

const items: UserMenuItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "learningpaths", label: "Learning Paths", href: "/learningpaths" },
  { key: "logout", label: "Log Out", href: "/logout", LinkComponent: "a" },
]

const meta: Meta<typeof UserMenu> = {
  title: "smoot-design/UserMenu",
  component: UserMenu,
  args: {
    loginUrl: "/login",
    items,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["desktop", "mobile"] },
  },
  decorators: [
    (Story) => (
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ backgroundColor: "#000", padding: "16px" }}
      >
        <Story />
      </Stack>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof UserMenu>

export const LoggedIn: Story = {
  args: { user: { name: "Jane Doe" } },
}

export const LoggedOutDesktop: Story = {
  args: { variant: "desktop" },
}

export const LoggedOutMobile: Story = {
  args: { variant: "mobile" },
}
