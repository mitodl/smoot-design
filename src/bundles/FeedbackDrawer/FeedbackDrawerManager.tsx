import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { FeedbackDrawer } from "./FeedbackDrawer"
import type { FeedbackData } from "./FeedbackDrawer"
import { getCookie } from "../../utils/getCookie"

type FeedbackPayload = {
  courseId?: string
  blockUsageKey?: string
  blockType?: string
  blockDisplayName?: string
}

type FeedbackOpenMessage = {
  type: "ol-feedback::drawer-open"
  payload: FeedbackPayload
  /** True when the opener's trigger was activated by keyboard (click detail 0). */
  viaKeyboard?: boolean
}

type FeedbackEnrichment = {
  courseName?: string
  unitTitle?: string
  url?: string
}

type FeedbackDrawerManagerProps = {
  messageOrigin: string
  submitUrl?: string
  csrfCookieName?: string
  csrfHeaderName?: string
  /** mit-learn @ensure_csrf_cookie endpoint the drawer primes to obtain the CSRF cookie. */
  csrfPrimeUrl?: string
  variant?: "drawer" | "slot"
  getEnrichment?: () => FeedbackEnrichment
  /** Notifies the host (e.g. the MFE sidebar coordinator) that the drawer
   * closed, so it can hide the surrounding slot/column now that it's empty. */
  onClose?: () => void
}

const OPEN_MESSAGE = "ol-feedback::drawer-open"
const CLOSE_MESSAGE = "ol-feedback::drawer-close"
// Sent back to the opener when the drawer closes so the (cross-origin) trigger
// can return keyboard focus to its megaphone button.
const CLOSED_MESSAGE = "ol-feedback::drawer-closed"

const FeedbackDrawerManager = ({
  messageOrigin,
  submitUrl,
  csrfCookieName,
  csrfHeaderName,
  csrfPrimeUrl,
  variant = "drawer",
  getEnrichment,
  onClose,
}: FeedbackDrawerManagerProps) => {
  const [payload, setPayload] = useState<FeedbackPayload | null>(null)
  const [open, setOpen] = useState(false)
  // Keyboard-initiated open (opener sends detail === 0) → drawer rings the
  // heading; a mouse open focuses it silently.
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false)
  // Bumped on every open so each open remounts FeedbackDrawer (resets state).
  const [openSeq, setOpenSeq] = useState(0)
  // Tracks the pending open-animation frame so a close can cancel it, otherwise
  // a close arriving before the frame fires would be overridden by setOpen(true).
  const openRafRef = useRef<number | null>(null)
  // The window that requested the open (the LMS iframe hosting the megaphone).
  // Captured so we can tell it to refocus its trigger on close; that button is
  // cross-origin, so the MFE parent can't focus it directly.
  const openerRef = useRef<Window | null>(null)

  const cancelPendingOpen = useCallback(() => {
    if (openRafRef.current !== null) {
      cancelAnimationFrame(openRafRef.current)
      openRafRef.current = null
    }
  }, [])

  // Keep the drawer mounted so MUI plays the slide-out; only slot mode tears down.
  const handleClose = useCallback(() => {
    cancelPendingOpen()
    if (variant === "slot") {
      setPayload(null)
    }
    setOpen(false)
    // Return keyboard focus to the megaphone trigger in the opener iframe.
    openerRef.current?.postMessage({ type: CLOSED_MESSAGE }, messageOrigin)
    // Let the host (MFE coordinator) hide the slot/column now that it's empty.
    onClose?.()
  }, [variant, cancelPendingOpen, messageOrigin, onClose])

  useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.origin !== messageOrigin) {
        return
      }
      const data = event.data as
        | { type?: string; payload?: FeedbackPayload; viaKeyboard?: boolean }
        | undefined
      if (data?.type === OPEN_MESSAGE) {
        openerRef.current = event.source as Window | null
        setOpenedViaKeyboard(!!data.viaKeyboard)
        setPayload(data.payload || {})
        setOpenSeq((seq) => seq + 1)
        if (variant === "slot") {
          setOpen(true)
        } else {
          setOpen(false)
          cancelPendingOpen()
          openRafRef.current = requestAnimationFrame(() => {
            openRafRef.current = null
            setOpen(true)
          })
        }
      } else if (data?.type === CLOSE_MESSAGE) {
        handleClose()
      }
    }
    window.addEventListener("message", cb)
    return () => {
      window.removeEventListener("message", cb)
      // Cancel any pending open frame so a stale rAF can't call setOpen(true)
      // after this effect re-runs (e.g. variant change) or the listener is torn down.
      cancelPendingOpen()
    }
  }, [messageOrigin, variant, handleClose, cancelPendingOpen])

  useEffect(() => cancelPendingOpen, [cancelPendingOpen])

  if (!payload) {
    return <div data-testid="feedback-drawer-manager-waiting" />
  }

  const handleSubmit = async (data: FeedbackData) => {
    if (!submitUrl) {
      return // dev stub: no endpoint configured -> resolve to success
    }
    const enrich = getEnrichment?.() ?? {}

    // Same auth mechanism AskTIM (AiChat) uses: session cookie + a CSRF token
    // read from a cookie and echoed into a header, with credentials included.
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (csrfCookieName && csrfHeaderName) {
      // Feedback has no AskTIM-style consumer to set the CSRF cookie, so prime
      // it (GET the @ensure_csrf_cookie endpoint) if it's missing.
      if (csrfPrimeUrl && !getCookie(csrfCookieName)) {
        try {
          await fetch(csrfPrimeUrl, { credentials: "include" })
        } catch {
          // best-effort
        }
      }
      const csrfToken = getCookie(csrfCookieName)
      if (csrfToken) {
        headers[csrfHeaderName] = csrfToken
      }
    }

    const response = await fetch(submitUrl, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        course_id: payload.courseId,
        course_name: enrich.courseName,
        block_usage_key: payload.blockUsageKey,
        block_type: payload.blockType,
        block_display_name: payload.blockDisplayName,
        unit_title: enrich.unitTitle,
        url: enrich.url ?? window.location.href,
        sentiment: data.sentiment,
        comment: data.comment,
      }),
    })
    if (!response.ok) {
      throw Object.assign(
        new Error(`Feedback submit failed: ${response.status}`),
        {
          status: response.status,
        },
      )
    }
  }

  return (
    <FeedbackDrawer
      key={openSeq}
      variant={variant}
      open={open}
      openedViaKeyboard={openedViaKeyboard}
      subtitle={payload.blockDisplayName}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  )
}

export { FeedbackDrawerManager }
export type {
  FeedbackDrawerManagerProps,
  FeedbackOpenMessage,
  FeedbackPayload,
  FeedbackEnrichment,
}
