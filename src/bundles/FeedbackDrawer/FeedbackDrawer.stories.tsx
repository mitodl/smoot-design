import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { FeedbackDrawer } from "./FeedbackDrawer"
import type { FeedbackData } from "./FeedbackDrawer"
import Button from "@mui/material/Button"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const logSubmit = async (data: FeedbackData) => {
  // Stubbed submit — the manager layer will POST this to mit-learn.
  // eslint-disable-next-line no-console
  console.log("feedback submit", data)
  await wait(700)
}

const failSubmit = async (data: FeedbackData) => {
  // eslint-disable-next-line no-console
  console.log("feedback submit (will fail)", data)
  await wait(700)
  throw new Error("stubbed failure")
}

const rateLimitedSubmit = async (data: FeedbackData) => {
  // eslint-disable-next-line no-console
  console.log("feedback submit (will 429)", data)
  await wait(700)
  // Mirrors what FeedbackDrawerManager throws on a 429 response: the drawer
  // reads `status` to show the throttle-specific copy.
  throw Object.assign(new Error("throttled"), { status: 429 })
}

const meta: Meta<typeof FeedbackDrawer> = {
  title: "smoot-design/Feedback/FeedbackDrawer",
  component: FeedbackDrawer,
}

export default meta

type Story = StoryObj<typeof FeedbackDrawer>

/**
 * Default drawer: slides in from the right. Click the button to open it, then
 * pick a reaction to reveal the matching prompt.
 */
export const DrawerStory: Story = {
  name: "Drawer (slides in)",
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Open feedback drawer
        </Button>
        <FeedbackDrawer
          variant="drawer"
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={logSubmit}
        />
      </>
    )
  },
}

/**
 * Slot variant: rendered inline (as it appears mounted in the Learning MFE
 * sidebar region). Shown open so the full flow is visible at a glance.
 */
export const SlotStory: Story = {
  name: "Slot (inline)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer variant="slot" open onSubmit={logSubmit} />
    </div>
  ),
}

/**
 * Slot variant opened via keyboard, so the heading shows its focus ring. Mirrors
 * a keyboard user activating the megaphone: FeedbackDrawerManager forwards the
 * keyboard-open flag to the drawer as `openedViaKeyboard`.
 */
export const SlotKeyboardStory: Story = {
  name: "Slot (keyboard open — focus ring)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer
        variant="slot"
        open
        openedViaKeyboard
        onSubmit={logSubmit}
      />
    </div>
  ),
}

/**
 * Slot variant opened with a reaction pre-selected, so the prompt + comment box
 * + Submit are visible without interaction.
 */
export const SlotSelectedStory: Story = {
  name: "Slot (reaction selected)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer
        variant="slot"
        open
        defaultSentiment="positive"
        onSubmit={logSubmit}
      />
    </div>
  ),
}

export const SlotWithBlockTitleStory: Story = {
  name: "Slot (block title in subheader)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer
        variant="slot"
        open
        subtitle="Lecture 3: Recursion"
        onSubmit={logSubmit}
      />
    </div>
  ),
}

/**
 * Slot with no block title: the subheader falls back to the (friendly) block
 * type, e.g. "this problem block".
 */
export const SlotBlockTypeFallbackStory: Story = {
  name: "Slot (block-type fallback in subheader)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer
        variant="slot"
        open
        blockType="problem"
        onSubmit={logSubmit}
      />
    </div>
  ),
}

export const SlotIdeaRequiredStory: Story = {
  name: "Slot (suggestion — comment required)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer
        variant="slot"
        open
        defaultSentiment="idea"
        subtitle="Lecture 3: Recursion"
        onSubmit={logSubmit}
      />
    </div>
  ),
}

/**
 * Same as Slot, but the stubbed submit rejects so the error state is visible.
 */
export const SlotErrorStory: Story = {
  name: "Slot (submit error)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer variant="slot" open onSubmit={failSubmit} />
    </div>
  ),
}

/**
 * Same as Slot, but the stubbed submit rejects with a 429 so the rate-limit
 * copy is visible (pick a reaction, then Submit).
 */
export const SlotRateLimitedStory: Story = {
  name: "Slot (rate limited)",
  render: () => (
    <div
      style={{
        width: "420px",
        maxWidth: "100%",
        border: "1px solid #e3e6ea",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      }}
    >
      <FeedbackDrawer variant="slot" open onSubmit={rateLimitedSubmit} />
    </div>
  ),
}
