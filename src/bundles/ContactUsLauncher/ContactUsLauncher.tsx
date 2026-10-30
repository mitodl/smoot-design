import * as React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { keyframes, useTheme } from "@emotion/react"
import useMediaQuery from "@mui/material/useMediaQuery"
import { RiChatAiLine } from "@remixicon/react"
import { ActionButton } from "../../components/Button/ActionButton"
import { Button } from "../../components/Button/Button"
import { AiDrawer } from "../AiDrawer/AiDrawer"
import type { AiDrawerSettings } from "../AiDrawer/AiDrawer"
import type { AiChatMessage } from "../../components/AiChat/types"

type ContactUsLauncherProps = {
  /** Drawer configuration, including the support agent's apiUrl. */
  settings: Omit<AiDrawerSettings, "title">
  /** The launcher button's accessible name; the button itself is icon-only
   * unless showLabel is set, in which case it's also the visible text. */
  label?: string
  /** Shows the label as visible text next to the icon instead of icon-only. */
  showLabel?: boolean
  className?: string
}

const CARD_INSET = "24px"

// AiDrawer renders its AskTIM wordmark and sparkle off this exact string.
const CARD_TITLE = "AskTIM"

const CARD_BADGE = "AI ASSISTANT"

/**
 * Opt a top-level host element out of being made `inert` while the full-screen
 * mobile card is open. For hosts that portal their own overlays into `body`:
 * without this their portal root is frozen behind a card it renders over.
 */
const KEEP_INTERACTIVE = "data-contact-us-keep-interactive"

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
// under the MUI Drawer (1200) and Modal (1300) rather than over them. The
// exception is the full-screen mobile card, which is raised to modal level
// below the sm breakpoint (see PopoverCard).
//
// Icon-only: a floating chat bubble reads as "open a chat" the way the FAB
// pattern common to chat widgets does, which a text pill doesn't signal as
// clearly. The label still names it for anyone not reading it visually.
const LAUNCHER_DIAMETER = "56px"

// Shared between the icon-only circle and the labelled pill below: both float
// in the same corner and hide (rather than unmount, so focus can return to
// them on close) while the card covers them.
const launcherPositionStyles = (theme: { zIndex: { fab: number } }) => ({
  position: "fixed" as const,
  bottom: CARD_INSET,
  right: CARD_INSET,
  zIndex: theme.zIndex.fab,
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
  "&[data-open]": {
    visibility: "hidden" as const,
  },
})

const LauncherIconButton = styled(ActionButton)(({ theme }) => ({
  ...launcherPositionStyles(theme),
  width: LAUNCHER_DIAMETER,
  height: LAUNCHER_DIAMETER,
}))

// edge="circular" on Button (unlike ActionButton) clips to a pill rather than
// a circle once there's text content driving the width.
const LauncherLabelButton = styled(Button)(({ theme }) => ({
  ...launcherPositionStyles(theme),
  height: LAUNCHER_DIAMETER,
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
    // Covering the viewport makes the card's own header the only way out, so it
    // has to outrank a host's fixed AppBar (1100) that would otherwise paint
    // over the Close button. No Escape key on a phone to fall back on.
    zIndex: theme.zIndex.modal,
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
  showLabel = false,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  })

  // Opening hides the launcher and moves focus to the card's heading, whose
  // outline AiDrawer suppresses unless openedViaKeyboard is set, so a keyboard
  // open needs the ring back (WCAG 2.4.7). Enter and Space fire a click with
  // detail 0; a pointer click reports 1 or more.
  const onLauncherClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenedViaKeyboard(event.detail === 0)
      setOpen(true)
    },
    [],
  )

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
   * ticket filed and have the support bot file a second one.
   *
   * The cost is the mirror case, which this deliberately accepts: if a learner
   * already has a live thread cookie and the very first send dies before
   * reaching learn-ai, the clear_history it carried never ran, and the retry
   * sends false against the thread that cookie still names. One boolean cannot
   * tell that apart from "learn-ai answered and the stream dropped", since
   * neither reaches the client. Filing one ticket against a stale thread beats
   * filing two against a live one, so the flag favours the latter.
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

  // The desktop card is non-modal, so there is no backdrop to catch these.
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

  // The full-screen card leaves nothing of the page visible or reachable, so
  // everything behind it is hidden rather than left for a screen reader or the
  // Tab key to wander into. This is also what keeps focus in the card below the
  // breakpoint, since browsers skip inert content.
  useEffect(() => {
    if (!open || !fullScreen) {
      return
    }
    const card = cardRef.current
    const hidden = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !element.contains(card) &&
        !element.hasAttribute(KEEP_INTERACTIVE) &&
        // Leave the host's own inert alone; clearing it on close would hand
        // back interactivity the host had deliberately taken away.
        !element.hasAttribute("inert"),
    )
    hidden.forEach((element) => element.setAttribute("inert", ""))
    const hostOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      hidden.forEach((element) => element.removeAttribute("inert"))
      document.body.style.overflow = hostOverflow
    }
  }, [open, fullScreen])

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
      {showLabel ? (
        <LauncherLabelButton
          ref={launcherRef}
          className={className}
          variant="primary"
          edge="circular"
          size="large"
          startIcon={<RiChatAiLine />}
          onClick={onLauncherClick}
          data-open={open ? "" : undefined}
        >
          {label}
        </LauncherLabelButton>
      ) : (
        <LauncherIconButton
          ref={launcherRef}
          className={className}
          variant="primary"
          edge="circular"
          size="large"
          aria-label={label}
          onClick={onLauncherClick}
          data-open={open ? "" : undefined}
        >
          <RiChatAiLine />
        </LauncherIconButton>
      )}
      {open ? (
        <PopoverCard
          ref={cardRef}
          role="dialog"
          aria-label={CARD_TITLE}
          aria-modal={fullScreen || undefined}
        >
          <CardBody
            variant="slot"
            open
            // On desktop the page behind stays usable, and the click-away
            // guard above keeps a draft when the learner goes to it. Trapping
            // Tab would leave the keyboard with no way across that didn't
            // close the card. Full screen there is nothing to cross to: the
            // inert page behind already keeps Tab in the card.
            trapFocus={false}
            openedViaKeyboard={openedViaKeyboard}
            onClose={onClose}
            settings={cardSettings}
            transformBody={transformBody}
          />
        </PopoverCard>
      ) : null}
    </>
  )
}

export { ContactUsLauncher, KEEP_INTERACTIVE }
export type { ContactUsLauncherProps }
