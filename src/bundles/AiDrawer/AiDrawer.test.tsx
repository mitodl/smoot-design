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

  test("focuses a named heading even when the payload omits a title", async () => {
    // title is optional; without a fallback the focused <h1> would be empty and
    // the screen reader would land on an unnamed element.
    render(
      <AiDrawer
        variant="slot"
        open
        settings={{ ...SETTINGS, title: undefined }}
      />,
      { wrapper: ThemeProvider },
    )
    const heading = screen.getByRole("heading", { level: 1 })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(heading).toHaveAccessibleName(/ai chat/i)
  })

  test("marks the heading for a focus ring only when opened via keyboard", () => {
    renderSlot({ openedViaKeyboard: true })
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "data-focus-ring",
    )
  })

  test("omits the heading focus-ring marker when opened by mouse", () => {
    renderSlot({ openedViaKeyboard: false })
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveAttribute(
      "data-focus-ring",
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

const VIDEO_SETTINGS: AiDrawerSettings = {
  blockType: "video",
  title: "AskTIM about this video",
  chat: { apiUrl: "http://localhost:4567/test" },
  summary: { apiUrl: "http://localhost:4567/content" },
}

describe("AiDrawer slot focus trap stays consistent across the video tabs", () => {
  const FLASHCARDS = [
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
    { question: "Q3", answer: "A3" },
  ]

  const setupVideoSlot = async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            results: [
              { summary: "A summary paragraph.", flashcards: FLASHCARDS },
            ],
          }),
      }),
    ) as unknown as typeof fetch
    renderSlot({ settings: VIDEO_SETTINGS })
    await waitFor(() => expect(screen.getAllByRole("tab")).toHaveLength(3))
    return screen.getByRole("region")
  }

  test("wraps Tab on the Summary tab using only the active panel (regression)", async () => {
    const region = await setupVideoSlot()
    await user.click(screen.getAllByRole("tab")[2]) // Summary

    const tabbable = realTabbable(region)
    const first = tabbable[0]
    const last = tabbable[tabbable.length - 1]

    // Guard the premise: the [hidden] chat panel's controls linger after the real
    // last stop — what used to make the trap miss the true last element.
    const rawTabbable = Array.from(
      region.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled)
    const rawLast = rawTabbable[rawTabbable.length - 1]
    expect(rawLast).not.toBe(last)
    expect(rawLast?.closest("[hidden]")).not.toBeNull()

    act(() => last.focus())
    fireEvent.keyDown(last, { key: "Tab" })
    expect(first).toHaveFocus()

    act(() => first.focus())
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true })
    expect(last).toHaveFocus()
  })
})
