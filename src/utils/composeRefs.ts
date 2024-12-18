import type { MutableRefObject, ForwardedRef, RefCallback } from "react"

/**
 * Compose 2+ refs. Useful when a reusable component needs a ref itself, but
 * consumers may also need the ref.
 */
const composeRefs = <T>(
  ...refs: (
    | ForwardedRef<T>
    | MutableRefObject<T | undefined>
    | RefCallback<T>
  )[]
): RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref) {
        ref.current = value
      }
    })
  }
}

export { composeRefs }
