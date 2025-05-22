import * as React from "react"
import { useEffect, useState } from "react"
import { AiDrawer } from "./AiDrawer"
import type { AiDrawerProps, AiDrawerInitMessage } from "./AiDrawer"
import { MathJaxContext } from "better-react-mathjax"

const hashPayload = (payload: AiDrawerInitMessage["payload"]) => {
  const str = JSON.stringify(payload)
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

type AiDrawerManagerProps = {
  /**
   * The origin of the messages that will be received to open the chat.
   * The drawer will ignore all message events not from this origin.
   */
  messageOrigin: string
} & AiDrawerProps

const AiDrawerManager = ({
  className,
  messageOrigin,
  transformBody,
  fetchOpts,
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
    <MathJaxContext>
      {Object.values(drawerStates).map(({ key, open, payload }) => (
        <AiDrawer
          key={key}
          className={className}
          transformBody={transformBody}
          fetchOpts={fetchOpts}
          payload={payload}
          open={open}
          onClose={() => {
            setDrawerStates((prev) => ({
              ...prev,
              [key]: { ...prev[key], open: false },
            }))
          }}
        />
      ))}
    </MathJaxContext>
  )
}

export { AiDrawerManager }
export type { AiDrawerManagerProps }
