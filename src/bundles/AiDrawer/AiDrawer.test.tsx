import { render, screen, waitFor } from "@testing-library/react"
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
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
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

  test("exposes the open slot as a region labelled by its heading", () => {
    renderSlot()
    screen.getByRole("region", { name: /ask\s*tim about this problem/i })
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
})
