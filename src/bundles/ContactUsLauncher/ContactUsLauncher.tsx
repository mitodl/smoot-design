import * as React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { RiChatAiLine } from "@remixicon/react"
import { ActionButton } from "../../components/Button/ActionButton"
import { AiDrawer } from "../AiDrawer/AiDrawer"
import type { AiDrawerSettings } from "../AiDrawer/AiDrawer"
import type { AiChatMessage } from "../../components/AiChat/types"

type ContactUsLauncherProps = {
  /** Drawer configuration, including the support agent's apiUrl. */
  settings: Omit<AiDrawerSettings, "title">
  /** The launcher button's accessible name; the button itself is icon-only. */
  label?: string
  className?: string
}

const CARD_INSET = "24px"

// AiDrawer renders its AskTIM wordmark and sparkle off this exact string.
const CARD_TITLE = "AskTIM"

const CARD_BADGE = "AI ASSISTANT"

// "Ask a question" invites one the support bot cannot answer.
const INPUT_PLACEHOLDER = "Describe what you need"

// Nothing on the way in says what this does with what the learner types: they
// clicked a button labelled "Contact us" and landed on a chat box.
const GREETING = [
  {
    role: "assistant" as const,
    content:
      "**How can we help?**\n\nI'm AskTIM, and I'm here to help you send a " +
      "request to the MIT Open Learning support team. Tell me what went " +
      "wrong and I'll pass it on.",
  },
]

// First fixed-position component in the library. zIndex.fab (1050) keeps it
// under the MUI Drawer (1200) and Modal (1300) rather than over them.
//
// Icon-only: a floating chat bubble reads as "open a chat" the way the FAB
// pattern common to chat widgets does, which a text pill doesn't signal as
// clearly. The label still names it for anyone not reading it visually.
const LAUNCHER_DIAMETER = "56px"

const LauncherButton = styled(ActionButton)(({ theme }) => ({
  position: "fixed",
  bottom: CARD_INSET,
  right: CARD_INSET,
  zIndex: theme.zIndex.fab,
  width: LAUNCHER_DIAMETER,
  height: LAUNCHER_DIAMETER,
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
  // The card lands on top of the launcher. Hiding rather than unmounting keeps
  // the ref alive so focus can return here on close.
  "&[data-open]": {
    visibility: "hidden",
  },
}))

const cardEnter = keyframes({
  from: { opacity: 0, transform: "translateY(8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
})

const PopoverCard = styled.div(({ theme }) => ({
  position: "fixed",
  bottom: CARD_INSET,
  right: CARD_INSET,
  width: "400px",
  height: "560px",
  maxHeight: `calc(100vh - 2 * ${CARD_INSET})`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
  backgroundColor: theme.custom.colors.white,
  borderRadius: "8px",
  boxShadow: "0 0 35px rgba(0, 0, 0, 0.25)",
  zIndex: theme.zIndex.fab + 1,
  animation: `${cardEnter} 250ms ease-in-out`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
  [theme.breakpoints.down("sm")]: {
    inset: 0,
    width: "auto",
    height: "auto",
    maxHeight: "none",
    borderRadius: 0,
  },
}))

// AiDrawer's slot container is padded for a 900px drawer; 400px needs less.
const CardBody = styled(AiDrawer)({
  "&&": {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "0 16px",
  },
})

const ContactUsLauncher: React.FC<ContactUsLauncherProps> = ({
  settings,
  label = "Contact us",
  className,
}) => {
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])
  const cardRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const conversationStarted = useRef(false)
  const historyCleared = useRef(false)

  /**
   * learn-ai's ChatRequestSerializer takes a single `message`, so the Vercel
   * messages array has to be collapsed before it is sent. clear_history starts a
   * new thread for the first send of a card session: the thread cookie outlives
   * the card, and the support bot files one ticket per thread, so a returning
   * learner would otherwise be read back the reference from their last visit.
   * Closing and reopening the card is how a learner starts another request on
   * purpose (see the reset below); within one open card, every send after the
   * first continues that same thread.
   *
   * The flag flips here, before the request goes out, rather than once a reply
   * comes back: learn-ai sets the thread cookie as soon as it answers, even if
   * the stream is then cut off before the client sees it finish, so a retry
   * that cleared history again could abandon a thread that already got a
   * ticket filed and have the support bot file a second one. Flipping early
   * costs nothing when the first send simply failed outright - learn-ai mints
   * a thread for a request with no cookie either way.
   */
  const hostPageUrl = settings.chat?.requestBody?.page_url

  const transformBody = useCallback(
    (messages: AiChatMessage[]) => {
      conversationStarted.current = true
      const clearHistory = !historyCleared.current
      historyCleared.current = true
      return {
        // Read at send, not at mount: a host that routes client-side changes the
        // URL under a card that init() only ever renders once.
        page_url: hostPageUrl ?? window.location.href,
        message: messages[messages.length - 1].content,
        clear_history: clearHistory,
      }
    },
    [hostPageUrl],
  )

  // The entry screen has room for a heading and nothing else, so the greeting
  // is a message in the thread instead. It is a default, so a host that sets
  // its own (a translated greeting) still wins.
  const cardSettings = React.useMemo(
    () => ({
      badge: CARD_BADGE,
      ...settings,
      title: CARD_TITLE,
      chat: {
        initialMessages: GREETING,
        placeholder: INPUT_PLACEHOLDER,
        ...settings.chat,
      },
    }),
    [settings],
  )

  const hasDraft = useCallback(() => {
    const field = cardRef.current?.querySelector<HTMLTextAreaElement>(
      "textarea, input[type='text']",
    )
    return Boolean(field?.value.trim())
  }, [])

  // The card is non-modal, so there is no backdrop to catch these.
  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      // Once there is a support request in progress, a stray click must not
      // throw it away. A half-typed description counts: it only lives in the
      // card's state, so closing loses it just as surely as losing a sent one.
      if (conversationStarted.current || hasDraft()) {
        return
      }
      const target = event.target as Node
      if (cardRef.current?.contains(target)) {
        return
      }
      // The launcher's own click would otherwise close and immediately reopen.
      if (launcherRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }
      // Escape aimed at a host dropdown or autofill must not take the card with
      // it. Body counts as ours only with nothing to lose: sending disables the
      // Send button that had focus, so focus lands on body with the card still
      // the only thing on screen, but so does a click on the page mid-draft.
      const focused = document.activeElement
      const inCard = Boolean(focused && cardRef.current?.contains(focused))
      const strayButHarmless =
        (!focused || focused === document.body) && !hasDraft()
      if (!inCard && !strayButHarmless) {
        return
      }
      setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, hasDraft])

  // Runs after the re-render that makes the launcher visible again (WCAG 2.4.3).
  useEffect(() => {
    if (wasOpen.current && !open) {
      launcherRef.current?.focus()
      // Closing and reopening is how a learner starts another request on
      // purpose, so the next send should clear history again instead of
      // continuing the thread (and ticket) from this visit.
      conversationStarted.current = false
      historyCleared.current = false
    }
    wasOpen.current = open
  }, [open])

  return (
    <>
      <LauncherButton
        ref={launcherRef}
        className={className}
        variant="primary"
        edge="circular"
        size="large"
        aria-label={label}
        onClick={() => setOpen(true)}
        data-open={open ? "" : undefined}
      >
        <RiChatAiLine />
      </LauncherButton>
      {open ? (
        <PopoverCard ref={cardRef} role="dialog" aria-label={CARD_TITLE}>
          <CardBody
            variant="slot"
            open
            onClose={onClose}
            settings={cardSettings}
            transformBody={transformBody}
          />
        </PopoverCard>
      ) : null}
    </>
  )
}

export { ContactUsLauncher }
export type { ContactUsLauncherProps }
