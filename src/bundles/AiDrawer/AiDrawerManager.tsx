import * as React from "react"
import { useEffect, useState } from "react"
import { AiDrawer } from "./AiDrawer"
import type { AiDrawerProps, AiDrawerSettings } from "./AiDrawer"
import { contentHash } from "../../utils/string"

type AiDrawerInitMessage = {
  type: "smoot-design::ai-drawer-open" | "smoot-design::tutor-drawer-open" // ("smoot-design::tutor-drawer-open" is legacy)
  payload: AiDrawerSettings & {
    blockUsageKey?: string
    /**
     * If provided, POST requests will be sent to this URL containing drawer event data.
     */
    trackingUrl?: string
  }
}

const hashPayload = (payload: AiDrawerInitMessage["payload"]) => {
  const str = JSON.stringify(payload)
  return contentHash(str)
}

type AiDrawerManagerProps = {
  /**
   * The origin of the messages that will be received to open the chat.
   * The drawer will ignore all message events not from this origin.
   */
  messageOrigin: string
  /**
   * Pass to target a specific drawer instance where multiple are on the page.
   */
  /** @deprecated The AiDrawerManager now handles multiple AiDrawer instance removing the need to target */
  target?: string
  /**
   * Function that returns API Client for use with tracking events.
   *
   * E.g., getAuthenticatedHttpClient from @edx/frontend-platform/auth
   */
  getTrackingClient?: () => {
    post: (url: string, data: Record<string, unknown>) => void
  }
} & Pick<AiDrawerProps, "className" | "transformBody" | "fetchOpts">

const AiDrawerManager = ({
  className,
  messageOrigin,
  transformBody,
  fetchOpts,
  getTrackingClient,
  target,
}: AiDrawerManagerProps) => {
  const [drawerStates, setDrawerStates] = useState<
    Record<
      string,
      {
        key: string
        open: boolean
        payload: AiDrawerInitMessage["payload"]
      }
    >
  >({})

  useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.origin !== messageOrigin) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `AiDrawerManager: received message from unexpected origin: ${event.origin}`,
          )
        }
        return
      }

      if (
        [
          "smoot-design::ai-drawer-open",
          "smoot-design::tutor-drawer-open", // legacy
        ].includes(event.data.type)
      ) {
        const key = hashPayload(event.data.payload)

        event.data.payload.chat.chatId = event.data.payload.chat.chatId || key

        setDrawerStates((prev) => ({
          ...prev,
          [key]: { key, open: false, payload: event.data.payload },
        }))
        requestAnimationFrame(() => {
          setDrawerStates((prev) => ({
            ...prev,
            [key]: { ...prev[key], open: true },
          }))
        })
      }
    }
    window.addEventListener("message", cb)
    return () => {
      window.removeEventListener("message", cb)
    }
  }, [messageOrigin, target])

  if (Object.values(drawerStates).length === 0) {
    return <div data-testid="ai-drawer-manager-waiting"></div>
  }

  return (
    <>
      {Object.values(drawerStates).map(({ key, open, payload }) => {
        const { trackingUrl, ...settings } = payload
        return (
          <AiDrawer
            key={key}
            className={className}
            transformBody={transformBody}
            fetchOpts={fetchOpts}
            settings={settings}
            open={open}
            onClose={() => {
              setDrawerStates((prev) => ({
                ...prev,
                [key]: { ...prev[key], open: false },
              }))
            }}
            onTrackingEvent={async (event) => {
              if (trackingUrl) {
                const trackingClient = getTrackingClient?.()
                if (!trackingClient) {
                  console.warn("trackingClient is not provided")
                  return
                }
                const { type, data } = event
                const prefix = "ol_openedx_chat.drawer"
                trackingClient.post(trackingUrl, {
                  event_type: `${prefix}.${type}`,
                  event_data: {
                    ...data,
                    blockUsageKey: payload.blockUsageKey,
                  },
                })
              }
            }}
          />
        )
      })}
    </>
  )
}

export { AiDrawerManager }
export type { AiDrawerManagerProps, AiDrawerInitMessage }
