import { composeRefs } from "../../utils/composeRefs"
import { styled } from "../StyleIsolation/StyleIsolation"
import * as React from "react"

/**
 * Returns the distance between visible content and the bottom of the element.
 */
const distanceFromBottom = (el: HTMLElement) => {
  return el.scrollHeight - el.clientHeight - el.scrollTop
}

/**
 * Scrolls to the bottom of the element.
 */
const scrollToBottom = (el: HTMLElement) => {
  el.scrollTop = el.scrollHeight
}

const Scroller = styled.div({
  overflow: "auto",
})

type ScrollSnapProps = {
  /**
   * Tolerance within which scroll will be considered "at the bottom" of the element.
   */
  threshold?: number
  /**
   * Content to be displayed
   */
  children: React.ReactNode
  className?: string
}

/**
 * Component that automatically scrolls to the bottom of the element when new
 * content is added, unless the user has scrolled up.
 */
const ScrollSnap = React.forwardRef<HTMLDivElement, ScrollSnapProps>(
  function ScrollSnap({ children, threshold = 2, className }, ref) {
    const el = React.useRef<HTMLDivElement>(null)

    // `content` a delayed version of children to allow measuring scroll position
    // using the old children.
    const [content, setContent] = React.useState(children)
    const wasAtBottom = React.useRef<boolean | null>(null)

    /**
     * The next two effects:
     * 1. Check if the element is at the bottom.
     * 2. Then set children -> content
     * 3. Then scroll to bottom (if needed)
     *
     * In this way, we can measure the scroll position before the new content is set.
     *
     * In React 19, this started requiring useLayoutEffect.
     */
    React.useLayoutEffect(() => {
      if (!el.current) return
      wasAtBottom.current = distanceFromBottom(el.current) < threshold
      setContent(children)
    }, [children, threshold])
    React.useLayoutEffect(() => {
      if (!el.current) return
      const atBottom = distanceFromBottom(el.current) < threshold
      if (wasAtBottom.current && !atBottom) {
        scrollToBottom(el.current)
        wasAtBottom.current = null
      }
    }, [content, threshold])

    return (
      <Scroller className={className} ref={composeRefs(el, ref)}>
        {content}
      </Scroller>
    )
  },
)

export { ScrollSnap }
export type { ScrollSnapProps }
