import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import user from "@testing-library/user-event"
import * as React from "react"
import { AiDrawer } from "./AiDrawer"
import type { AiDrawerSettings, AiDrawerProps } from "./AiDrawer"
import { ThemeProvider } from "../../components/ThemeProvider/ThemeProvider"

jest.mock("../../components/AiChat/Markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <div>{children}</div>,
  }
})

jest.mock("better-react-mathjax", () => ({
  __esModule: true,
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.ResizeObserver = MockResizeObserver

const SETTINGS: AiDrawerSettings = {
  blockType: "problem",
  title: "AskTIM about this problem",
  chat: { apiUrl: "http://localhost:4567/test" },
}

const renderSlot = (props: Partial<AiDrawerProps> = {}) =>
  render(<AiDrawer variant="slot" open settings={SETTINGS} {...props} />, {
    wrapper: ThemeProvider,
  })

const FOCUSABLE_SELECTOR =
  "a[href], button, input, textarea, select, [tabindex]"

// Controls the browser actually stops on: excludes disabled and [hidden].
const realTabbable = (region: HTMLElement) =>
  Array.from(region.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest("[hidden]"),
  )

describe("AiDrawer slot focus management", () => {
  test("moves focus to the heading when opened (slot variant)", async () => {
    renderSlot()
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
  })

  test("exposes the open slot as a region with a static label (not its heading)", () => {
    renderSlot()
    // The heading is focused on open, so a heading-derived region name would
    // announce the title twice.
    const region = screen.getByRole("region", { name: /^ai chat$/i })
    expect(region).not.toHaveAttribute("aria-labelledby")
  })

  test("closes when Escape is pressed inside the open slot", async () => {
    const onClose = jest.fn()
    renderSlot({ onClose })
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
    await user.keyboard("{Escape}")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test("ignores Escape when focus is outside the open slot", async () => {
    const onClose = jest.fn()
    renderSlot({ onClose })
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
    // A host may hide the slot without closing it and move focus away; a stray
    // Escape there must not dismiss the hidden drawer.
    act(() => (document.activeElement as HTMLElement | null)?.blur())
    await user.keyboard("{Escape}")
    expect(onClose).not.toHaveBeenCalled()
  })

  test("exposes the return-to-block control as the first Tab stop, named for the block", async () => {
    renderSlot({ onReturnToBlock: jest.fn(), onClose: jest.fn() })
    const returnBtn = screen.getByRole("button", {
      name: "Return to the problem",
    })
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
    await user.tab()
    expect(returnBtn).toHaveFocus()
    expect(screen.getByRole("button", { name: "Close" })).not.toHaveFocus()
  })

  test("omits the return-to-block control in the modal drawer variant", () => {
    // In the aria-modal drawer the skip link would fight the modal's own focus
    // trap, so it must not render.
    render(
      <AiDrawer
        variant="drawer"
        open
        settings={SETTINGS}
        onReturnToBlock={jest.fn()}
        onClose={jest.fn()}
      />,
      { wrapper: ThemeProvider },
    )
    expect(screen.queryByRole("button", { name: /return to/i })).toBeNull()
  })

  test("wraps Tab focus within the open slot instead of escaping to the page", () => {
    renderSlot({ onReturnToBlock: jest.fn(), onClose: jest.fn() })
    const region = screen.getByRole("region")
    const tabbable = realTabbable(region)
    const first = tabbable[0]
    const last = tabbable[tabbable.length - 1]

    act(() => last.focus())
    fireEvent.keyDown(last, { key: "Tab" })
    expect(first).toHaveFocus()

    act(() => first.focus())
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true })
    expect(last).toHaveFocus()
  })

  test("wraps Shift+Tab from the initial heading focus to the last control", async () => {
    renderSlot({ onReturnToBlock: jest.fn(), onClose: jest.fn() })
    const heading = screen.getByRole("heading", { level: 1 })
    // The heading has tabIndex -1, so it is not in the tabbable list; the first
    // Shift+Tab must still wrap to the last control.
    await waitFor(() => expect(heading).toHaveFocus())
    const region = screen.getByRole("region")
    const tabbable = realTabbable(region)
    const last = tabbable[tabbable.length - 1]

    fireEvent.keyDown(heading, { key: "Tab", shiftKey: true })
    expect(last).toHaveFocus()
  })
})
