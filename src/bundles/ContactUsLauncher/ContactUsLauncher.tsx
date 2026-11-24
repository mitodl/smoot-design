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
import { extractCommentsData } from "../../components/AiChat/utils"

type ContactUsLauncherProps = {
  /** Drawer configuration, including the support agent's apiUrl. */
  settings: Omit<AiDrawerSettings, "title">
  /** The launcher button's accessible name; the button itself is icon-only
   * unless showLabel is set, in which case it's also the visible text. Wins
   * over the label set in learn-ai's admin. */
  label?: string
  /** Shows the label as visible text next to the icon instead of icon-only. */
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

// A press always sends this, whatever the chip shows. learn-ai blanks an
// escalated turn's message, so it never reaches the ticket.
const ESCALATE_LABEL = "Contact the support team"

// Not "Send": the composer's submit button already has that name. A press
// sends these words whatever the chip shows: learn-ai checks a Send press for a
// cancellation before it reads the confirm flag.
const SEND_LABEL = "Send request"
// Sent with the cancel flag. learn-ai before the flag existed cancels on this
// word instead.
const CANCEL_LABEL = "Cancel"

const COPY_KEYS = [
  "launcher_label",
  "escalate_label",
  "send_label",
  "cancel_label",
  "placeholder",
  "badge",
  "greeting",
] as const

type WidgetCopy = Partial<Record<(typeof COPY_KEYS)[number], string>>

const SUPPORT_AGENT_PATH = /\/http\/support_agent\/$/

const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// A pressed chip's label becomes the learner's own message, which renders as
// Markdown, so only letters, numbers and plain punctuation are let through.
const PLAIN_LABEL = /^[\p{L}\p{N}][\p{L}\p{N} .,!?'’"()\-:;&/]*$/u
const NUMBERED_LIST_START = /^\d+[.)]/

/**
 * The admin checks these too, but a row written another way skips that check.
 */
const withUsableChipLabels = (copy: WidgetCopy): WidgetCopy => {
  const usable = { ...copy }
  for (const key of ["escalate_label", "send_label", "cancel_label"] as const) {
    const label = usable[key]
    if (
      label &&
      // The composer's submit button is already named "Send".
      (sameText(label, "Send") ||
        !PLAIN_LABEL.test(label) ||
        NUMBERED_LIST_START.test(label))
    ) {
      delete usable[key]
    }
  }
  // Chips are keyed by their text, so Send and Cancel can't match.
  if (
    sameText(
      usable.send_label ?? SEND_LABEL,
      usable.cancel_label ?? CANCEL_LABEL,
    )
  ) {
    delete usable.send_label
    delete usable.cancel_label
  }
  return usable
}

/**
 * Text product set in learn-ai's admin, served next to the support agent. Any
 * failure leaves {} so the built-in text shows: the widget must never be worse
 * than it is without the admin.
 */
const useWidgetCopy = (apiUrl: string | undefined): WidgetCopy => {
  const [copy, setCopy] = useState<WidgetCopy>({})
  useEffect(() => {
    if (!apiUrl || !SUPPORT_AGENT_PATH.test(apiUrl)) {
      return
    }
    const controller = new AbortController()
    fetch(apiUrl.replace(SUPPORT_AGENT_PATH, "/api/v0/support_widget_copy/"), {
      credentials: "omit",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : {}))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") {
          return
        }
        const fields = data as Record<string, unknown>
        const strings: WidgetCopy = {}
        COPY_KEYS.forEach((key) => {
          const value = fields[key]
          if (typeof value === "string" && value.trim()) {
            strings[key] = value.trim()
          }
        })
        setCopy(withUsableChipLabels(strings))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [apiUrl])
  return copy
}

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
  label,
  showLabel = false,
  escalateLabel,
  className,
}) => {
  const copy = useWidgetCopy(settings.chat?.apiUrl)
  const launcherLabel = label ?? copy.launcher_label ?? "Contact us"
  // Taken when the card opens, so copy that lands mid-conversation can't swap
  // the greeting under the learner or have a screen reader announce it twice.
  const [cardCopy, setCardCopy] = useState<WidgetCopy>({})
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
      setCardCopy(copy)
      setOpen(true)
    },
    [copy],
  )

  const cardRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const conversationStarted = useRef(false)
  const historyCleared = useRef(false)
  // A ref so transformBody sees the press without waiting for a re-render.
  // Cleared on read: learn-ai blanks every escalated turn's message.
  const escalating = useRef(false)
  // Same, for Send: a stored press would approve every later turn.
  const confirming = useRef(false)
  const cancelling = useRef(false)

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
      historyCleared.current = true
      const escalate = escalating.current
      escalating.current = false
      const confirm = confirming.current
      confirming.current = false
      const cancel = cancelling.current
      cancelling.current = false
      // learn-ai decides on these words, so a chip press sends them whatever
      // label the admin gave the chip.
      let message = messages[messages.length - 1].content
      if (confirm) {
        message = SEND_LABEL
      } else if (cancel) {
        message = CANCEL_LABEL
      } else if (escalate) {
        message = ESCALATE_LABEL
      }
      return {
        // Read at send, not at mount: a host that routes client-side changes the
        // URL under a card that init() only ever renders once.
        page_url: hostPageUrl ?? window.location.href,
        message,
        clear_history: clearHistory,
        // Omitted when false so ordinary turns are unchanged on the wire.
        ...(escalate && { escalate: true }),
        ...(confirm && { confirm: true }),
        ...(cancel && { cancel: true }),
      }
    },
    [hostPageUrl],
  )

  // The entry screen has room for a heading and nothing else, so the greeting
  // is a message in the thread instead. It is a default, so a host that sets
  // its own (a translated greeting) still wins.
  const cardSettings = React.useMemo(
    () => ({
      badge: cardCopy.badge ?? CARD_BADGE,
      ...settings,
      title: CARD_TITLE,
      chat: {
        initialMessages: cardCopy.greeting
          ? [{ role: "assistant" as const, content: cardCopy.greeting }]
          : GREETING,
        placeholder: cardCopy.placeholder ?? INPUT_PLACEHOLDER,
        ...settings.chat,
      },
    }),
    [settings, cardCopy],
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
          {launcherLabel}
        </LauncherLabelButton>
      ) : (
        <LauncherIconButton
          ref={launcherRef}
          className={className}
          variant="primary"
          edge="circular"
          size="large"
          aria-label={launcherLabel}
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
            onClose={onClose}
            settings={cardSettings}
            transformBody={transformBody}
            escalation={{
              label: escalateLabel ?? cardCopy.escalate_label ?? ESCALATE_LABEL,
            }}
            onEscalate={() => {
              escalating.current = true
            }}
            messageActions={(message) =>
              message.data?.awaiting_send
                ? [
                    {
                      label: cardCopy.send_label ?? SEND_LABEL,
                      onPress: () => {
                        confirming.current = true
                      },
                    },
                    {
                      label: cardCopy.cancel_label ?? CANCEL_LABEL,
                      onPress: () => {
                        cancelling.current = true
                      },
                    },
                  ]
                : []
            }
          />
        </PopoverCard>
      ) : null}
    </>
  )
}

export { ContactUsLauncher, KEEP_INTERACTIVE }
export type { ContactUsLauncherProps }
