import * as React from "react"
import { useEffect, useState } from "react"
import type {
  RemoteTutorDrawerProps,
  RemoteTutorDrawerInitMessage,
} from "./RemoteTutorDrawer"
import { RemoteTutorDrawer } from "./RemoteTutorDrawer"
import { MathJaxContext } from "better-react-mathjax"

const hashPayload = (payload: RemoteTutorDrawerInitMessage["payload"]) => {
  const str = JSON.stringify(payload)
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export type AiDrawerManagerProps = RemoteTutorDrawerProps

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
        payload: RemoteTutorDrawerInitMessage["payload"]
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

      console.log("event", event)

      if (
        event.data.type === "smoot-design::tutor-drawer-open"
        // event.data.payload.target === target
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

  console.log("drawerStates", drawerStates)

  return (
    <MathJaxContext>
      {Object.values(drawerStates).map(({ key, open, payload }) => (
        <RemoteTutorDrawer
          key={key}
          className={className}
          messageOrigin={messageOrigin}
          transformBody={transformBody}
          // target={target}
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
