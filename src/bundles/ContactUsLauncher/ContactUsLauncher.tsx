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
import { TrackingEventType } from "../AiDrawer/trackingEvents"
import type { TrackingEvent } from "../AiDrawer/trackingEvents"
import type { AiChatMessage } from "../../components/AiChat/types"
import { extractCommentsData } from "../../components/AiChat/utils"

type ContactUsLauncherProps = {
  /** Drawer configuration, including the support agent's apiUrl. */
  settings: Omit<AiDrawerSettings, "title">
  /** The launcher button's accessible name, and its visible text when
   * showLabel is on. */
  label?: string
  /** Shows the label as text next to the icon on screens wider than the sm
   * breakpoint. Set false for an icon-only button. */
  showLabel?: boolean
  /** Text of the button that hands the chat to the support team. */
  escalateLabel?: string
  className?: string
}

const CARD_INSET = "24px"

// AiDrawer renders its AskTIM wordmark and sparkle off this exact string.
const CARD_TITLE = "AskTIM"

const CARD_BADGE = "AI ASSISTANT"

/**
 * Opts a host element out of being inerted while the full-screen mobile card is
 * open, so a host that portals its own overlays can keep its portal root
 * reachable. Put it on the element itself: `inert` inherits, so marking a
 * descendant of an inerted element does nothing.
 */
const KEEP_INTERACTIVE = "data-contact-us-keep-interactive"

// "Ask a question" invites one the support bot cannot answer.
const INPUT_PLACEHOLDER = "Describe what you need"

// learn-ai blanks an escalated turn's message, so this never reaches the ticket.
const ESCALATE_LABEL = "Contact the support team"

// Not "Send": the composer's submit button already has that name. learn-ai
// files on the confirm flag and blanks this label, so the wording is free.
const SEND_LABEL = "Send request"
// One word learn-ai already reads as a cancellation, so no flag is needed.
const CANCEL_LABEL = "Cancel"

const CONFIRM_CLOSE_TEXT = "Your request hasn't been sent yet. Close anyway?"

// Nothing else on the way in says what this card does.
const GREETING = [
  {
    role: "assistant" as const,
    content:
      "Tell us what's on your mind: a question, a problem, or feedback. " +
      "It all goes to our support team.",
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

// The ring keeps the button visible on red and dark page sections. It lives in
// the shadow so the hover state below can restate it without a border shift.
const launcherShadow = (white: string) =>
  `0 0 0 2px ${white}, 0 6px 20px rgba(0, 0, 0, 0.16)`

// Shared between the icon-only circle and the labelled pill below: both float
// in the same corner and hide (rather than unmount, so focus can return to
// them on close) while the card covers them.
const launcherPositionStyles = (theme: {
  zIndex: { fab: number }
  custom: { colors: { white: string } }
}) => ({
  position: "fixed" as const,
  bottom: CARD_INSET,
  right: CARD_INSET,
  zIndex: theme.zIndex.fab,
  boxShadow: launcherShadow(theme.custom.colors.white),
  // Button's own hover style drops the shadow, and the ring with it.
  "&&:hover": {
    boxShadow: launcherShadow(theme.custom.colors.white),
  },
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
  // Below sm the text is hidden, so fall back to the icon-only circle.
  [theme.breakpoints.down("sm")]: {
    width: LAUNCHER_DIAMETER,
    minWidth: 0,
    padding: 0,
    justifyContent: "center",
    "& > :first-of-type": { margin: 0 },
  },
}))

const LauncherText = styled.span(({ theme }) => ({
  [theme.breakpoints.down("sm")]: { display: "none" },
}))

const ConfirmBackdrop = styled.div(({ theme }) => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  zIndex: 1,
  boxSizing: "border-box",
  "& > div": {
    backgroundColor: theme.custom.colors.white,
    borderRadius: "8px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "320px",
  },
  "& p": { margin: 0 },
  "& .actions": { display: "flex", gap: "8px", justifyContent: "flex-end" },
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
  label = "Help",
  showLabel = true,
  escalateLabel = ESCALATE_LABEL,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false)
  const [confirmingClose, setConfirmingClose] = useState(false)
  const confirmTextId = React.useId()

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
  // Set once a reply reports the ticket was filed; cleared by the next send.
  const filed = useRef(false)
  // True from the Send press until its reply ends: the ticket may be filed by
  // then even though the reply hasn't said so yet.
  const filing = useRef(false)
  const focusBeforeConfirm = useRef<HTMLElement | null>(null)
  const confirmRef = useRef<HTMLDivElement>(null)
  const historyCleared = useRef(false)
  // A ref so transformBody sees the press without waiting for a re-render.
  // Cleared on read: learn-ai blanks every escalated turn's message.
  const escalating = useRef(false)
  // Same, for Send: a stored press would approve every later turn.
  const confirming = useRef(false)

  /**
   * learn-ai's ChatRequestSerializer takes a single `message`, so the Vercel
   * messages array has to be collapsed before it is sent. clear_history starts a
   * new thread for the first send of a card session: the thread cookie outlives
   * the card, and the support bot files one ticket per thread, so a returning
   * learner would otherwise be read back the reference from their last visit.
   * Closing and reopening the card is how a learner starts another request on
   * purpose (see the reset below). Within one open card, later sends continue
   * that thread until a reply says it was filed.
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
      // Skips replies with no metadata: learn-ai's throttle text has none and
      // never reached a thread.
      const lastData = [...messages]
        .reverse()
        .filter((m) => m.role === "assistant")
        .map((m) => extractCommentsData(m.content))
        .find((data) => data && Object.keys(data).length > 0)
      // A filed thread files nothing more, so the next request needs its own.
      // Safe to repeat on a retry: nothing files on a thread's first turn.
      const clearHistory = !historyCleared.current || Boolean(lastData?.filed)
      filed.current = false
      historyCleared.current = true
      const escalate = escalating.current
      escalating.current = false
      const confirm = confirming.current
      confirming.current = false
      filing.current = confirm
      return {
        // Read at send, not at mount: a host that routes client-side changes the
        // URL under a card that init() only ever renders once.
        page_url: hostPageUrl ?? window.location.href,
        message: messages[messages.length - 1].content,
        clear_history: clearHistory,
        // Omitted when false so ordinary turns are unchanged on the wire.
        ...(escalate && { escalate: true }),
        ...(confirm && { confirm: true }),
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

  // Close button and Escape: a request that was started but not filed asks
  // first, since closing wipes it and nothing reaches support.
  const requestClose = useCallback(() => {
    // A typed draft still counts after filing: it is a new request to lose.
    const nothingToLose = (filed.current || filing.current) && !hasDraft()
    if (!nothingToLose && (conversationStarted.current || hasDraft())) {
      focusBeforeConfirm.current = document.activeElement as HTMLElement | null
      setConfirmingClose(true)
      return
    }
    setOpen(false)
  }, [hasDraft])

  const onTrackingEvent = useCallback((event: TrackingEvent) => {
    if (event.type === TrackingEventType.Response) {
      filing.current = false
      filed.current = Boolean(
        extractCommentsData(String(event.data?.value ?? ""))?.filed,
      )
    }
  }, [])

  const keepChatting = useCallback(() => {
    // An inert element can't take focus, so lift it before focusing.
    cardRef.current?.firstElementChild?.removeAttribute("inert")
    setConfirmingClose(false)
    const previous = focusBeforeConfirm.current
    previous?.focus()
    // Right after Send the old target is disabled or body, which can't take it.
    if (!previous || document.activeElement !== previous) {
      cardRef.current
        ?.querySelector<HTMLElement>("textarea, input[type='text']")
        ?.focus()
    }
  }, [])

  // Desktop leaves the page behind interactive, so wrap Tab inside the dialog.
  const trapConfirmTab = useCallback((event: KeyboardEvent) => {
    const buttons = confirmRef.current?.querySelectorAll("button")
    if (!buttons?.length) {
      return
    }
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  // The card behind the confirmation must not take Tab or screen reader focus.
  useEffect(() => {
    const body = cardRef.current?.firstElementChild
    if (!confirmingClose || !body) {
      return
    }
    body.setAttribute("inert", "")
    confirmRef.current
      ?.querySelector<HTMLElement>("[data-keep-chatting]")
      ?.focus()
    return () => body.removeAttribute("inert")
  }, [confirmingClose])

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
      if (event.key === "Tab" && confirmingClose) {
        trapConfirmTab(event)
        return
      }
      if (event.key !== "Escape") {
        return
      }
      // Escape aimed at a host dropdown or autofill must not take the card with
      // it. Body counts as ours only with nothing to lose: sending disables the
      // Send button that had focus, so focus lands on body with the card still
      // the only thing on screen, but so does a click on the page mid-draft.
      if (confirmingClose) {
        keepChatting()
        return
      }
      const focused = document.activeElement
      const inCard = Boolean(focused && cardRef.current?.contains(focused))
      const strayButHarmless =
        (!focused || focused === document.body) && !hasDraft()
      if (!inCard && !strayButHarmless) {
        return
      }
      requestClose()
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [
    open,
    hasDraft,
    requestClose,
    confirmingClose,
    keepChatting,
    trapConfirmTab,
  ])

  // The full-screen card covers everything, so the page behind it is inerted
  // rather than left for a screen reader or Tab to wander into. Browsers skip
  // inert content, so this is also what keeps focus in the card.
  useEffect(() => {
    if (!open || !fullScreen) {
      return
    }
    const card = cardRef.current
    // init({ container }) renders into the host's own element, so the page
    // behind is the siblings of every ancestor up to body, not body's children.
    const hidden: HTMLElement[] = []
    for (
      let node = card as Element | null;
      node && node !== document.body;
      node = node.parentElement
    ) {
      const siblings = Array.from(node.parentElement?.children ?? [])
      hidden.push(
        ...siblings.filter(
          (element): element is HTMLElement =>
            element !== node &&
            element instanceof HTMLElement &&
            !element.hasAttribute(KEEP_INTERACTIVE) &&
            // Clearing this on close would hand back interactivity the host
            // had deliberately taken away.
            !element.hasAttribute("inert"),
        ),
      )
    }
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
      filed.current = false
      filing.current = false
      setConfirmingClose(false)
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
          aria-label={label}
          onClick={onLauncherClick}
          data-open={open ? "" : undefined}
        >
          <LauncherText>{label}</LauncherText>
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
            // On desktop the page behind stays usable, and the click-away guard
            // above keeps a draft when the learner goes to it; trapping Tab
            // would leave the keyboard no way across. Full screen needs no trap
            // either, since the inert page behind already keeps Tab in the card.
            trapFocus={false}
            openedViaKeyboard={openedViaKeyboard}
            onClose={requestClose}
            onTrackingEvent={onTrackingEvent}
            settings={cardSettings}
            transformBody={transformBody}
            escalation={{ label: escalateLabel }}
            onEscalate={() => {
              escalating.current = true
            }}
            messageActions={(message) =>
              message.data?.awaiting_send
                ? [
                    {
                      label: SEND_LABEL,
                      onPress: () => {
                        confirming.current = true
                      },
                    },
                    { label: CANCEL_LABEL },
                  ]
                : []
            }
          />
          {confirmingClose ? (
            <ConfirmBackdrop>
              <div
                role="alertdialog"
                aria-modal
                aria-label="Close request?"
                aria-describedby={confirmTextId}
                ref={confirmRef}
              >
                <p id={confirmTextId}>{CONFIRM_CLOSE_TEXT}</p>
                <div className="actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setOpen(false)}
                  >
                    Close anyway
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    data-keep-chatting
                    onClick={keepChatting}
                  >
                    Keep chatting
                  </Button>
                </div>
              </div>
            </ConfirmBackdrop>
          ) : null}
        </PopoverCard>
      ) : null}
    </>
  )
}

export { ContactUsLauncher, KEEP_INTERACTIVE }
export type { ContactUsLauncherProps }
