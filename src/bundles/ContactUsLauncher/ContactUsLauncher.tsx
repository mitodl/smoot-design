import * as React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { RiCustomerService2Line } from "@remixicon/react"
import { Button } from "../../components/Button/Button"
import { AiDrawer } from "../AiDrawer/AiDrawer"
import type { AiDrawerSettings } from "../AiDrawer/AiDrawer"
import { TrackingEventType } from "../AiDrawer/trackingEvents"
import type { TrackingEvent } from "../AiDrawer/trackingEvents"
import type { AiChatMessage } from "../../components/AiChat/types"

type ContactUsLauncherProps = {
  /** Drawer configuration, including the support agent's apiUrl. */
  settings: Omit<AiDrawerSettings, "title">
  /** Visible button text. Also the accessible name. */
  label?: string
  className?: string
}

const CARD_INSET = "24px"

// AiDrawer renders its AskTIM wordmark and sparkle off this exact string.
const CARD_TITLE = "AskTIM"

const ENTRY_TITLE = "What do you need help with?"

// First fixed-position component in the library. zIndex.fab (1050) keeps it
// under the MUI Drawer (1200) and Modal (1300) rather than over them.
const LauncherButton = styled(Button)(({ theme }) => ({
  position: "fixed",
  bottom: CARD_INSET,
  right: CARD_INSET,
  zIndex: theme.zIndex.fab,
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
   * new thread for each card session: the thread cookie outlives the card, and
   * the support bot files one ticket per thread, so a returning learner would
   * otherwise be read back the reference from their last visit.
   *
   * It stays on until a send comes back, because a send that errored never
   * started a thread for the retry to continue.
   */
  const transformBody = useCallback((messages: AiChatMessage[]) => {
    conversationStarted.current = true
    return {
      message: messages[messages.length - 1].content,
      clear_history: !historyCleared.current,
    }
  }, [])

  const onTrackingEvent = useCallback((event: TrackingEvent) => {
    if (event.type === TrackingEventType.Response) {
      historyCleared.current = true
    }
  }, [])

  // AiDrawer only defaults the entry screen on for video blocks, so ask for it
  // explicitly; without it the card opens blank above the input. These are
  // defaults, so a host that sets its own (a translated title) still wins.
  const cardSettings = React.useMemo(
    () => ({
      ...settings,
      title: CARD_TITLE,
      chat: {
        entryScreenEnabled: true,
        entryScreenTitle: ENTRY_TITLE,
        ...settings.chat,
        requestBody: {
          page_url: window.location.href,
          ...settings.chat?.requestBody,
        },
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
      // it. Body still counts as ours: sending disables the Send button that had
      // focus, so focus lands there with the card still the only thing on screen.
      const focused = document.activeElement
      if (
        focused &&
        focused !== document.body &&
        !cardRef.current?.contains(focused)
      ) {
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
        startIcon={<RiCustomerService2Line />}
        onClick={() => setOpen(true)}
        data-open={open ? "" : undefined}
      >
        {label}
      </LauncherButton>
      {open ? (
        <PopoverCard ref={cardRef} role="dialog" aria-label={CARD_TITLE}>
          <CardBody
            variant="slot"
            open
            onClose={onClose}
            settings={cardSettings}
            transformBody={transformBody}
            onTrackingEvent={onTrackingEvent}
          />
        </PopoverCard>
      ) : null}
    </>
  )
}

export { ContactUsLauncher }
export type { ContactUsLauncherProps }
