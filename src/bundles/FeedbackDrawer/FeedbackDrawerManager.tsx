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
  /**
   * mit-learn APISIX login route (e.g. `<mit-learn>/login`). When set, a learner
   * with no mit-learn session is routed through a login popup before the POST, so
   * their drafted feedback is preserved and auto-submitted once the session
   * exists. Omit to disable the popup-login flow (the drawer then POSTs directly
   * and surfaces any 403). Requires `csrfPrimeUrl` (the identity probe).
   */
  loginUrl?: string
  /** Poll interval (ms) while waiting for the login popup to establish a session. */
  loginPollIntervalMs?: number
  /** Max time (ms) to wait for the login popup before giving up. */
  loginTimeoutMs?: number
  variant?: "drawer" | "slot"
  getEnrichment?: () => FeedbackEnrichment
}

const OPEN_MESSAGE = "ol-feedback::drawer-open"
const CLOSE_MESSAGE = "ol-feedback::drawer-close"

const FeedbackDrawerManager = ({
  messageOrigin,
  submitUrl,
  csrfCookieName,
  csrfHeaderName,
  csrfPrimeUrl,
  loginUrl,
  loginPollIntervalMs = 1000,
  loginTimeoutMs = 30000,
  variant = "drawer",
  getEnrichment,
}: FeedbackDrawerManagerProps) => {
  const [payload, setPayload] = useState<FeedbackPayload | null>(null)
  const [open, setOpen] = useState(false)
  // Bumped on every open so each open remounts FeedbackDrawer (resets state).
  const [openSeq, setOpenSeq] = useState(0)
  // Tracks the pending open-animation frame so a close can cancel it, otherwise
  // a close arriving before the frame fires would be overridden by setOpen(true).
  const openRafRef = useRef<number | null>(null)

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
  }, [variant, cancelPendingOpen])

  useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.origin !== messageOrigin) {
        return
      }
      const data = event.data as
        | { type?: string; payload?: FeedbackPayload }
        | undefined
      if (data?.type === OPEN_MESSAGE) {
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

  // Whether the learner currently has a mit-learn session. null = unknown (not
  // yet probed, or login not configured). Held in a ref so handleSubmit can read
  // it synchronously and open the login popup within the click (popup-safe).
  const isAuthenticatedRef = useRef<boolean | null>(null)

  // GET the CSRF-prime endpoint (mit-learn users/me). Doubles as an identity
  // probe: the JSON carries `is_authenticated`. Also (re)primes the CSRF cookie.
  // Returns null when the state can't be determined.
  const checkAuthenticated = useCallback(async (): Promise<boolean | null> => {
    if (!csrfPrimeUrl) {
      return null
    }
    try {
      const res = await fetch(csrfPrimeUrl, { credentials: "include" })
      if (!res.ok) {
        return null
      }
      const body = (await res.json()) as { is_authenticated?: boolean }
      return body?.is_authenticated === true
    } catch {
      return null
    }
  }, [csrfPrimeUrl])

  // When login is configured, learn the session state as soon as the drawer
  // opens — before the learner can click Submit — so the popup can be opened
  // synchronously from that click without being blocked.
  useEffect(() => {
    if (!open || !loginUrl || !csrfPrimeUrl) {
      return
    }
    let cancelled = false
    checkAuthenticated().then((authed) => {
      if (!cancelled && authed !== null) {
        isAuthenticatedRef.current = authed
      }
    })
    return () => {
      cancelled = true
    }
  }, [open, loginUrl, csrfPrimeUrl, checkAuthenticated])

  if (!payload) {
    return <div data-testid="feedback-drawer-manager-waiting" />
  }

  // Poll the identity probe until the login popup has established a mit-learn
  // session (or the learner cancels / we time out). Closes the popup on success.
  const waitForSession = async (popup: Window): Promise<void> => {
    const deadline = Date.now() + loginTimeoutMs
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, loginPollIntervalMs))
      const authed = await checkAuthenticated()
      if (authed) {
        isAuthenticatedRef.current = true
        if (!popup.closed) {
          popup.close()
        }
        return
      }
      if (popup.closed) {
        throw new Error("Feedback login was cancelled")
      }
      if (Date.now() > deadline) {
        popup.close()
        throw new Error("Feedback login timed out")
      }
    }
  }

  const handleSubmit = async (data: FeedbackData) => {
    if (!submitUrl) {
      return // dev stub: no endpoint configured -> resolve to success
    }
    // When login is configured and the open-time probe found no mit-learn
    // session, route the learner through a login popup before the POST so their
    // drafted feedback is preserved and auto-submitted once the session exists.
    // window.open must run synchronously in the click gesture (no await before
    // it) or the browser's popup blocker kills it — hence the open-time probe.
    if (loginUrl && isAuthenticatedRef.current === false) {
      const popup = window.open(
        loginUrl,
        "ol-feedback-login",
        "popup,width=480,height=680",
      )
      if (!popup) {
        throw new Error("Feedback login popup was blocked")
      }
      await waitForSession(popup)
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
      // A 403 means the POST was anonymous (no mit-learn session). Record that
      // so a retry routes through the login popup; the learner's draft is kept.
      if (response.status === 403) {
        isAuthenticatedRef.current = false
      }
      throw new Error(`Feedback submit failed: ${response.status}`)
    }
  }

  return (
    <FeedbackDrawer
      key={openSeq}
      variant={variant}
      open={open}
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
