import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
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
  test("shows the Appzi-style header", () => {
    renderDrawer()
    screen.getByRole("heading", { level: 1, name: "Tell us what you think" })
  })

  test("shows the question and three reactions", () => {
    renderDrawer()
    screen.getByText("What kind of feedback do you have about this content?")
    expect(screen.getAllByRole("radio")).toHaveLength(3)
    screen.getByRole("radio", { name: "Liked it" })
    screen.getByRole("radio", { name: "Not working" })
    screen.getByRole("radio", { name: "Suggestion" })
  })

  test("subheader asks about the block by title when one is provided", () => {
    renderDrawer({ subtitle: "Lecture 1: Limits" })
    // The subheader question labels the reaction group (it is not a heading), so
    // the block context announces when a reaction is focused.
    screen.getByRole("radiogroup", {
      name: /what kind of feedback do you have about.*lecture 1: limits/i,
    })
  })

  test("prefers the title over the block type when both are provided", () => {
    renderDrawer({ subtitle: "Lecture 1: Limits", blockType: "video" })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about Lecture 1: Limits?",
    })
  })

  test("subheader falls back to the friendly block type when there is no title", () => {
    renderDrawer({ blockType: "problem" })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this problem?",
    })
  })

  test("falls back to generic wording for a type with no single noun", () => {
    // Studio's "html" component also holds images, embeds, and
    // announcements, so there's no one word that's right for all of them.
    renderDrawer({ blockType: "html" })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this content?",
    })
  })

  test("tolerates casing and stray whitespace in the block type", () => {
    renderDrawer({ blockType: " Video " })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this video?",
    })
  })

  test.each([
    ["annotatable", "reading"],
    ["drag-and-drop-v2", "drag-and-drop activity"],
    ["edx_sga", "assignment"],
    ["lti", "tool"],
    ["lti_consumer", "tool"],
    ["openassessment", "open response"],
    ["pdf", "PDF"],
    ["poll", "poll"],
    ["problem", "problem"],
    ["staffgradedxblock", "assignment"],
    ["survey", "survey"],
    ["video", "video"],
    ["videoalpha", "video"],
    ["word_cloud", "word cloud"],
  ])("names %p as %p when its title comes through blank", (blockType, noun) => {
    renderDrawer({ blockType, subtitle: "  " })
    screen.getByRole("radiogroup", {
      name: `What kind of feedback do you have about this ${noun}?`,
    })
  })

  test("names the built-in poll, which never sends a title", () => {
    renderDrawer({ blockType: "poll_question", subtitle: "" })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this poll?",
    })
  })

  test.each([
    ["Which approach did you prefer?", "poll"],
    ["Try this one!", "problem"],
    ["To be continued…", "video"],
    ["为什么要用递归？", "poll"],
    ["すごい！", "video"],
    ["第4章。", "annotatable"],
    ["Recursion (why?)", "poll"],
    ["She said ‘wait!’”", "annotatable"],
    ["为什么要用递归？）", "poll"],
  ])(
    "does not add a second terminator to %p, which already ends a sentence",
    (title, blockType) => {
      renderDrawer({ subtitle: title, blockType })
      screen.getByRole("radiogroup", {
        name: `What kind of feedback do you have about ${title}`,
      })
    },
  )

  test.each([
    ["Problem Set 1.", "problem"],
    ["Ch. 4.", "annotatable"],
    ['Read "The Raven."', "annotatable"],
  ])(
    "still asks a question about %p, whose trailing period isn't a sentence end",
    (title, blockType) => {
      renderDrawer({ subtitle: title, blockType })
      screen.getByRole("radiogroup", {
        name: `What kind of feedback do you have about ${title}?`,
      })
    },
  )

  test("still adds the question mark to a title that ends in a bracket", () => {
    renderDrawer({ subtitle: "Midterm (offline)", blockType: "problem" })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about Midterm (offline)?",
    })
  })

  test("falls back to generic wording rather than leaking an unmapped type slug", () => {
    renderDrawer({ blockType: "ol_openedx_chat_xblock" })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this content?",
    })
  })

  test.each(["constructor", "__proto__", "toString"])(
    "treats the inherited key %p as unmapped",
    (blockType) => {
      // Without the own-key check these resolve to Object.prototype members.
      renderDrawer({ blockType })
      screen.getByRole("radiogroup", {
        name: "What kind of feedback do you have about this content?",
      })
    },
  )

  test("renders generic wording when the block type isn't a string", () => {
    // The type arrives over postMessage, so the sender controls its shape.
    renderDrawer({
      blockType: { toString: () => "video" } as unknown as string,
    })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this content?",
    })
  })

  test("still renders when the title isn't a string", () => {
    // An unguarded .trim() would throw mid-render and blank the panel.
    renderDrawer({
      subtitle: 5 as unknown as string,
      blockType: "video",
    })
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this video?",
    })
  })

  test("keeps the subheader question out of the heading structure", () => {
    // Only the drawer title is a heading; the question is the radiogroup legend,
    // so it isn't announced a second time during heading navigation.
    renderDrawer({ subtitle: "Lecture 1: Limits" })
    expect(screen.getAllByRole("heading")).toHaveLength(1)
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull()
  })

  test("names the reaction group with the visible question, not a mismatched label", () => {
    renderDrawer()
    // The group's accessible name is the on-screen subheader question, so it
    // matches what sighted users see (no stray "rate" wording).
    screen.getByRole("radiogroup", {
      name: "What kind of feedback do you have about this content?",
    })
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
    act(() => liked.focus())
    await user.keyboard("{Enter}")
    expect(
      screen.getByRole("textbox", { name: "What did you like?" }),
    ).toHaveFocus()
  })

  test("previews the comment box for the first reaction when focus lands on it", () => {
    renderDrawer()
    // Selection follows focus, so the first radio previews its prompt and box
    // like the others.
    const liked = screen.getByRole("radio", { name: "Liked it" })
    act(() => liked.focus())
    expect(liked).toHaveAttribute("aria-checked", "true")
    screen.getByRole("textbox", { name: "What did you like?" })
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

  test("keeps the button visible and busy (not greyed-disabled) while submitting", async () => {
    let resolveSubmit: () => void = () => {}
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )
    renderDrawer({ onSubmit })
    await user.click(screen.getByRole("radio", { name: "Suggestion" }))
    // A suggestion needs a comment before Submit is actionable.
    await user.type(
      screen.getByRole("textbox", { name: "What is your suggestion?" }),
      "captions",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    // In flight: the control stays visually filled (not the native :disabled grey
    // that hides the white spinner) but announces itself busy/non-actionable.
    const busy = screen.getByRole("button", { name: /submitting/i })
    expect(busy).toHaveAttribute("aria-busy", "true")
    expect(busy).toHaveAttribute("aria-disabled", "true")
    expect(busy).not.toBeDisabled()

    // A second click while busy is ignored — no double submit.
    await user.click(busy)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveSubmit()
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

  test("blocks a Submit with an empty suggestion and shows an inline error", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    renderDrawer({ onSubmit })
    await user.click(screen.getByRole("radio", { name: "Suggestion" }))
    const submit = screen.getByRole("button", { name: "Submit" })

    // No nagging before the learner acts: the error only appears on Submit.
    expect(screen.queryByText(/add a comment/i)).toBeNull()
    await user.click(submit)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(/add a comment/i)
    // Focus is pulled to the box so the learner can start typing immediately.
    const box = screen.getByRole("textbox", {
      name: "What is your suggestion?",
    })
    expect(box).toHaveFocus()
    expect(box).toHaveAccessibleDescription(/add a comment/i)

    // Typing a real comment clears the error, and Submit then goes through.
    await user.type(box, "add captions")
    expect(screen.queryByText(/add a comment/i)).toBeNull()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledWith({
      sentiment: "idea",
      comment: "add captions",
    })
  })

  test("treats a whitespace-only suggestion as missing on Submit", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    renderDrawer({ onSubmit })
    await user.click(screen.getByRole("radio", { name: "Suggestion" }))
    await user.type(
      screen.getByRole("textbox", { name: "What is your suggestion?" }),
      "   ",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(/add a comment/i)
  })

  test("marks the suggestion comment as required for screen readers", async () => {
    renderDrawer()
    await user.click(screen.getByRole("radio", { name: "Suggestion" }))
    // aria-required conveys the requirement up front; the visible red asterisk
    // is the sighted equivalent.
    expect(
      screen.getByRole("textbox", { name: "What is your suggestion?" }),
    ).toBeRequired()
    // No error until the learner tries to submit.
    expect(screen.queryByRole("alert")).toBeNull()
  })

  test("keeps the required error out of the way for a like", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    renderDrawer({ onSubmit })
    // A like/dislike comment is optional: Submit goes straight through with no
    // error, even when the box is empty.
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(screen.queryByText(/add a comment/i)).toBeNull()
    expect(onSubmit).toHaveBeenCalledWith({
      sentiment: "positive",
      comment: "",
    })
  })

  test("arrow keys move selection across reactions (roving tabIndex)", async () => {
    renderDrawer()
    const [first, second] = screen.getAllByRole("radio")
    // Before any selection, only the first radio is in the tab order.
    expect(first).toHaveAttribute("tabindex", "0")
    expect(second).toHaveAttribute("tabindex", "-1")

    act(() => first.focus())
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
    act(() => first.focus())
    await user.keyboard("{ArrowRight}")
    // Arrowing reveals the comment field but keeps focus on the radios; only
    // activation moves focus.
    expect(screen.getByRole("radio", { name: "Not working" })).toHaveFocus()
    expect(
      screen.getByRole("textbox", { name: "What's not working?" }),
    ).not.toHaveFocus()
  })

  test("wraps Tab focus within the slot instead of escaping to the page", async () => {
    renderDrawer({ onClose: jest.fn() })
    // Reveal the comment box + Submit so the drawer has its full control set.
    await user.click(screen.getByRole("radio", { name: "Liked it" }))

    const close = screen.getByRole("button", { name: "Close" })
    const submit = screen.getByRole("button", { name: "Submit" })

    // Tab off the last control (Submit) wraps back to the first (Close) instead
    // of walking out into the page footer.
    act(() => submit.focus())
    fireEvent.keyDown(submit, { key: "Tab" })
    expect(close).toHaveFocus()

    // Shift+Tab off the first control (Close) wraps to the last (Submit).
    act(() => close.focus())
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true })
    expect(submit).toHaveFocus()
  })

  test("moves focus to the heading when opened (slot variant)", async () => {
    renderDrawer()
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
  })

  test("makes the heading programmatically focusable", () => {
    renderDrawer()
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "tabindex",
      "-1",
    )
  })

  test("describes the heading with the question so block context is announced on open", () => {
    // Focus lands on the h1 on open (#12876), but the title carries no block
    // context. Pointing the heading's aria-describedby at the question means the
    // SR announces which block right away, not only on reaching the radiogroup.
    renderDrawer({ subtitle: "Lecture 1: Limits" })
    const heading = screen.getByRole("heading", { level: 1 })
    const describedById = heading.getAttribute("aria-describedby")
    expect(describedById).toBeTruthy()
    const question = document.getElementById(describedById as string)
    expect(question).toHaveTextContent(
      /what kind of feedback do you have about.*lecture 1: limits/i,
    )
  })

  test("marks the heading for a focus ring only when opened via keyboard", () => {
    renderDrawer({ openedViaKeyboard: true })
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "data-focus-ring",
    )
  })

  test("omits the heading focus-ring marker when opened by mouse", () => {
    renderDrawer({ openedViaKeyboard: false })
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveAttribute(
      "data-focus-ring",
    )
  })

  test("names the open slot region by its heading only, not the question", () => {
    renderDrawer({ subtitle: "Lecture 1: Limits" })
    // The region is named by the h1 alone; block context is delivered once via
    // the radiogroup label, so it isn't repeated on region entry.
    screen.getByRole("region", { name: "Tell us what you think" })
    screen.getByRole("radiogroup", {
      name: /what kind of feedback do you have about.*lecture 1: limits/i,
    })
  })

  test("closes when Escape is pressed inside the open slot", async () => {
    const onClose = jest.fn()
    renderDrawer({ onClose })
    // Focus lands in the panel on open; Escape from anywhere inside should
    // dismiss it (matching the dialog dismissal convention, WCAG 2.1.2).
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    )
    await user.keyboard("{Escape}")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test("renders no return-to-block control unless a handler is provided", () => {
    renderDrawer({ subtitle: "Lecture 1: Limits" })
    expect(screen.queryByRole("button", { name: /return to/i })).toBeNull()
  })

  test("keeps an unmapped type slug out of the return-to-block control", () => {
    renderDrawer({
      blockType: "ol_openedx_chat_xblock",
      onReturnToBlock: jest.fn(),
    })
    screen.getByRole("button", { name: "Return to the content" })
  })

  test("exposes the return-to-block control as the first Tab stop, named for the block", async () => {
    renderDrawer({
      blockType: "video",
      onReturnToBlock: jest.fn(),
      onClose: jest.fn(),
    })
    const returnBtn = screen.getByRole("button", {
      name: "Return to the video",
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
})
