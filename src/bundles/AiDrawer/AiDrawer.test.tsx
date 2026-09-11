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

// react-markdown and better-react-mathjax share one moduleNameMapper stub, so
// their jest.mock factories collide (last wins). This single factory serves both:
// a passthrough MathJaxContext and a default Markdown component.
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

describe("AiDrawer slot focus management", () => {
  test("moves focus to the heading when opened (slot variant)", async () => {
    renderSlot()
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
  })

  test("re-focuses the heading when the trigger is re-activated while already open", async () => {
    // After "Return to block", the slot stays open with focus on the cross-origin
    // trigger. Re-activating the trigger posts another open; the manager bumps
    // openNonce (open stays true), which must pull focus back into the drawer.
    const { rerender } = render(
      <AiDrawer variant="slot" open settings={SETTINGS} openNonce={1} />,
      { wrapper: ThemeProvider },
    )
    const heading = screen.getByRole("heading", { level: 1 })
    await waitFor(() => expect(heading).toHaveFocus())

    // Simulate "Return to block": focus leaves the drawer heading.
    act(() => heading.blur())
    expect(heading).not.toHaveFocus()

    rerender(<AiDrawer variant="slot" open settings={SETTINGS} openNonce={2} />)
    await waitFor(() => expect(heading).toHaveFocus())
  })

  test("makes the heading programmatically focusable", () => {
    renderSlot()
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "tabindex",
      "-1",
    )
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
    // A static name, not the heading text: the heading is focused on open, so a
    // heading-derived region name would make the title announce twice.
    const region = screen.getByRole("region", { name: /^ai chat$/i })
    expect(region).not.toHaveAttribute("aria-labelledby")
  })

  test("closes when Escape is pressed inside the open slot", async () => {
    const onClose = jest.fn()
    renderSlot({ onClose })
    // Focus lands in the panel on open; Escape from anywhere inside should
    // dismiss it (matching the dialog dismissal convention, WCAG 2.1.2).
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
    // A host may hide the slot (to show another sidebar) without closing it and
    // move focus away; a stray Escape there must not dismiss the hidden drawer.
    act(() => (document.activeElement as HTMLElement | null)?.blur())
    await user.keyboard("{Escape}")
    expect(onClose).not.toHaveBeenCalled()
  })

  test("hides the decorative header icon from assistive tech", () => {
    renderSlot()
    // The sparkle glyph is decorative; the h1 already names the drawer.
    const heading = screen.getByRole("heading", { level: 1 })
    const icon = heading.parentElement?.querySelector("svg")
    expect(icon).toHaveAttribute("aria-hidden", "true")
  })

  test("renders no return-to-block control unless a handler is provided", () => {
    renderSlot()
    expect(screen.queryByRole("button", { name: /return to/i })).toBeNull()
  })

  test("exposes the return-to-block control as the first Tab stop, named for the block", async () => {
    renderSlot({ onReturnToBlock: jest.fn(), onClose: jest.fn() })
    const returnBtn = screen.getByRole("button", {
      name: "Return to the problem",
    })
    // Focus starts on the heading on open; the first Tab reaches the return
    // "skip link" before the Close button.
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
    await user.tab()
    expect(returnBtn).toHaveFocus()
    expect(screen.getByRole("button", { name: "Close" })).not.toHaveFocus()
  })

  test("invokes onReturnToBlock when the skip link is activated", async () => {
    const onReturnToBlock = jest.fn()
    renderSlot({ onReturnToBlock })
    await user.click(
      screen.getByRole("button", { name: "Return to the problem" }),
    )
    expect(onReturnToBlock).toHaveBeenCalledTimes(1)
  })

  test("omits the return-to-block control in the modal drawer variant", () => {
    // Return-to-block is a slot-only skip link; in the aria-modal drawer it would
    // try to move focus out of the modal's own focus trap, so it must not render.
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
    const tabbable = Array.from(
      region.querySelectorAll<HTMLElement>(
        "a[href], button, input, textarea, select, [tabindex]",
      ),
    ).filter((el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled)
    const first = tabbable[0]
    const last = tabbable[tabbable.length - 1]

    // Tab off the last control wraps back to the first instead of walking out
    // into the page (the slot is non-modal, so we trap it ourselves).
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
    // Focus starts on the heading (tabIndex -1, so it is not in the tabbable
    // list); the very first Shift+Tab must still wrap to the last control rather
    // than escape above the region.
    await waitFor(() => expect(heading).toHaveFocus())
    const region = screen.getByRole("region")
    const tabbable = realTabbable(region)
    const last = tabbable[tabbable.length - 1]

    fireEvent.keyDown(heading, { key: "Tab", shiftKey: true })
    expect(last).toHaveFocus()
  })
})

const FOCUSABLE_SELECTOR =
  "a[href], button, input, textarea, select, [tabindex]"

// The controls the browser actually stops on: excludes disabled and [hidden]
// (kept-mounted inactive panels) — what the trap must use for first/last.
const realTabbable = (region: HTMLElement) =>
  Array.from(region.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest("[hidden]"),
  )

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
              {
                summary: "A concise summary paragraph.",
                flashcards: FLASHCARDS,
              },
            ],
          }),
      }),
    ) as unknown as typeof fetch
    renderSlot({ settings: VIDEO_SETTINGS })
    // The chat + flashcards + summary tabs appear once the content fetch resolves.
    await waitFor(() => expect(screen.getAllByRole("tab")).toHaveLength(3))
    return screen.getByRole("region")
  }

  test("wraps Tab on the Summary tab instead of escaping to the page (regression)", async () => {
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

  test("wraps Tab on the Flashcards tab", async () => {
    const region = await setupVideoSlot()
    await user.click(screen.getAllByRole("tab")[1]) // Flashcards

    const tabbable = realTabbable(region)
    const first = tabbable[0]
    const last = tabbable[tabbable.length - 1]

    act(() => last.focus())
    fireEvent.keyDown(last, { key: "Tab" })
    expect(first).toHaveFocus()
  })

  test("keeps the same wrap flow on the Chat tab while composing a message", async () => {
    const region = await setupVideoSlot()
    // Chat is the default tab; simulate the learner typing to communicate with it.
    await user.type(screen.getByRole("textbox"), "How does this work?")

    const tabbable = realTabbable(region)
    const first = tabbable[0]
    const last = tabbable[tabbable.length - 1]

    act(() => last.focus())
    fireEvent.keyDown(last, { key: "Tab" })
    expect(first).toHaveFocus()
  })
})
