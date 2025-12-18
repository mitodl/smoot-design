import { useRef, useEffect } from "react"

/**
 * Calls a function at a specified interval.
 *
 * Based on https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<null | (() => void)>(null)
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current?.(), delay)
      return () => clearInterval(id)
    } else {
      return () => {}
    }
  }, [delay])
}

export { useInterval }
