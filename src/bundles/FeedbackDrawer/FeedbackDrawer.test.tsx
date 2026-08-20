import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import * as React from "react"
import {
  FeedbackDrawer,
  RATE_LIMIT_STATUS,
  RATE_LIMIT_MESSAGE,
  GENERIC_ERROR_MESSAGE,
} from "./FeedbackDrawer"
import { ThemeProvider } from "../../components/ThemeProvider/ThemeProvider"

const renderDrawer = (props = {}) =>
  render(<FeedbackDrawer variant="slot" open {...props} />, {
    wrapper: ThemeProvider,
  })

describe("FeedbackDrawer", () => {
  test("shows the question and three reactions", () => {
    renderDrawer()
    screen.getByText("How was this content?")
    expect(screen.getAllByRole("radio")).toHaveLength(3)
    screen.getByRole("radio", { name: "Liked it" })
    screen.getByRole("radio", { name: "Not working" })
    screen.getByRole("radio", { name: "Suggestion" })
  })

  test("names the reaction group with the visible question, not a mismatched label", () => {
    renderDrawer()
    // The group's accessible name is the on-screen "How was this content?"
    // heading, so it matches what sighted users see (no stray "rate" wording).
    screen.getByRole("radiogroup", { name: "How was this content?" })
    expect(screen.queryByRole("radiogroup", { name: /rate/i })).toBeNull()
  })

  test("selecting a reaction reveals its prompt, a comment box, and Submit", async () => {
    renderDrawer()
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    screen.getByText("What did you like?")
    screen.getByRole("textbox", { name: "What did you like?" })
    screen.getByRole("button", { name: "Submit" })
  })

  test("moves focus into the comment field when a reaction is clicked", async () => {
    renderDrawer()
    await user.click(screen.getByRole("radio", { name: "Not working" }))
    expect(
      screen.getByRole("textbox", { name: "What's not working?" }),
    ).toHaveFocus()
  })

  test("moves focus into the comment field when a reaction is activated by keyboard", async () => {
    renderDrawer()
    const liked = screen.getByRole("radio", { name: "Liked it" })
    liked.focus()
    await user.keyboard("{Enter}")
    expect(
      screen.getByRole("textbox", { name: "What did you like?" }),
    ).toHaveFocus()
  })

  test("submitting calls onSubmit and shows the success state", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    renderDrawer({ onSubmit })
    await user.click(screen.getByRole("radio", { name: "Suggestion" }))
    await user.type(
      screen.getByRole("textbox", { name: "What is your suggestion?" }),
      "add captions",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(onSubmit).toHaveBeenCalledWith({
      sentiment: "idea",
      comment: "add captions",
    })
    await screen.findByText("Thank you for your feedback!")
  })

  test("shows the error state when onSubmit rejects", async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error("boom"))
    renderDrawer({ onSubmit })
    await user.click(screen.getByRole("radio", { name: "Not working" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))
    await screen.findByText(GENERIC_ERROR_MESSAGE)
  })

  test("shows a rate-limit message when onSubmit rejects with a 429", async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("throttled"), { status: RATE_LIMIT_STATUS }),
      )
    renderDrawer({ onSubmit })
    await user.click(screen.getByRole("radio", { name: "Not working" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))
    await screen.findByText(RATE_LIMIT_MESSAGE)
  })

  test("arrow keys move selection across reactions (roving tabIndex)", async () => {
    renderDrawer()
    const [first, second] = screen.getAllByRole("radio")
    // Before any selection, only the first radio is in the tab order.
    expect(first).toHaveAttribute("tabindex", "0")
    expect(second).toHaveAttribute("tabindex", "-1")

    first.focus()
    await user.keyboard("{ArrowRight}")

    const negative = screen.getByRole("radio", { name: "Not working" })
    expect(negative).toHaveAttribute("aria-checked", "true")
    expect(negative).toHaveFocus()
    expect(negative).toHaveAttribute("tabindex", "0")

    // ArrowLeft back to the first, then ArrowLeft again wraps to the last.
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    const suggestion = screen.getByRole("radio", { name: "Suggestion" })
    expect(suggestion).toHaveAttribute("aria-checked", "true")
    expect(suggestion).toHaveFocus()
  })

  test("arrow-key selection stays on the radios and doesn't jump to the comment box", async () => {
    renderDrawer()
    const [first] = screen.getAllByRole("radio")
    first.focus()
    await user.keyboard("{ArrowRight}")
    // Arrowing reveals the comment field but keeps focus on the group so the
    // user can keep comparing options; only an explicit activation moves focus.
    expect(screen.getByRole("radio", { name: "Not working" })).toHaveFocus()
    expect(
      screen.getByRole("textbox", { name: "What's not working?" }),
    ).not.toHaveFocus()
  })

  test("renders the subtitle (content title) under the heading", () => {
    render(
      <FeedbackDrawer variant="slot" open subtitle="Lecture 1: Limits" />,
      { wrapper: ThemeProvider },
    )
    expect(screen.getByText("Lecture 1: Limits")).toBeVisible()
  })
})
