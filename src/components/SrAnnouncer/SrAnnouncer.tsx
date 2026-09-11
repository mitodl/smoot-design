import * as React from "react"
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden"
import { useEffect } from "react"
import { useDevCheckStable } from "../../utils/useDevCheckStable"

type SrAnnouncerProps = {
  /**
   * Message text to be read to user.
   *
   * Cannot contain HTML elements—only text.
   */
  message: string
  /**
   * Messages to display while the component is in a loading state.
   *
   * Identical consecutive messages may not be read on some screen readers.
   */
  loadingMessages?: {
    delay: number
    text: string
  }[]
  isLoading: boolean
}

const DEFAULT_PROPS: Pick<Required<SrAnnouncerProps>, "loadingMessages"> = {
  loadingMessages: [
    { delay: 1500, text: "Loading" },
    { delay: 4000, text: "Still loading" },
  ],
}

/**
 * A component that announces messages to screen readers as they come in.
 */
const SrAnnouncer: React.FC<SrAnnouncerProps> = ({
  message,
  isLoading,
  loadingMessages = DEFAULT_PROPS.loadingMessages,
}) => {
  const [loadingMsgIndex, setLoadingMsgIndex] = React.useState(-1)

  // aria-live only announces content that mutates in *after* the region is in
  // the a11y tree. Render empty on first paint, then fill on the next tick so an
  // initial message (e.g. a chat greeting) is announced instead of staying silent.
  const [mounted, setMounted] = React.useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * If loadingMessages changes, the timeouts are reset.
   * Desirable if the change is real, undesirable if it's a mistake (e.g., by
   * passing an array literal as a prop).
   */
  useDevCheckStable(
    loadingMessages,
    "SrAnnouncer: loadingMessages changed (by ===) unexpectedly. This may interfere with loading message visibility",
  )

  React.useLayoutEffect(() => {
    setLoadingMsgIndex(-1)
  }, [isLoading, loadingMessages])

  useEffect(() => {
    const next = loadingMessages[loadingMsgIndex + 1]
    if (!isLoading || !next) return () => {}
    const id = setTimeout(() => {
      setLoadingMsgIndex(loadingMsgIndex + 1)
    }, next.delay)
    return () => {
      clearTimeout(id)
    }
  }, [isLoading, loadingMsgIndex, loadingMessages])

  const loadingTxt: string | undefined = loadingMessages[loadingMsgIndex]?.text

  return (
    <VisuallyHidden aria-atomic="true" aria-live="polite">
      {mounted ? (isLoading ? loadingTxt : message) : ""}
    </VisuallyHidden>
  )
}

export { SrAnnouncer }
export type { SrAnnouncerProps }
