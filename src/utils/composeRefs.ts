import type { MutableRefObject, ForwardedRef, RefCallback } from "react"

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
