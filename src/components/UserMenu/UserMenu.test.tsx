import * as React from "react"
import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import { ThemeProvider } from "../ThemeProvider/ThemeProvider"
import { UserMenu } from "./UserMenu"
import type { UserMenuItem } from "./UserMenu"

const items: UserMenuItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "logout", label: "Log Out", href: "/logout", LinkComponent: "a" },
]

const renderMenu = (props: Partial<React.ComponentProps<typeof UserMenu>>) =>
  render(<UserMenu loginUrl="/login" {...props} />, { wrapper: ThemeProvider })

test.each([
  { variant: "desktop" as const, name: "Log In" },
  { variant: "mobile" as const, name: "Log in" },
])("logged out renders a $variant login link", ({ variant, name }) => {
  renderMenu({ variant })
  expect(screen.getByRole("link", { name })).toHaveAttribute("href", "/login")
  expect(screen.queryByRole("button", { name: "User Menu" })).toBe(null)
})

test("logged in shows the name and opens the items on click", async () => {
  renderMenu({ user: { name: "Jane Doe" }, items })

  expect(screen.queryByRole("link", { name: "Log In" })).toBe(null)
  const trigger = screen.getByRole("button", { name: "User Menu" })
  expect(trigger).toHaveTextContent("Jane Doe")
  expect(trigger).toHaveAttribute("aria-expanded", "false")

  await user.click(trigger)

  expect(trigger).toHaveAttribute("aria-expanded", "true")
  expect(screen.getByRole("menuitem", { name: "Dashboard" })).toHaveAttribute(
    "href",
    "/dashboard",
  )
  expect(screen.getByRole("menuitem", { name: "Log Out" })).toHaveAttribute(
    "href",
    "/logout",
  )
})
