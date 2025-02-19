import { useEffect, useRef } from "react"

/**
 * Emits `console.error` if two subsequent values of `jsonSerializable` serialize
 * to the same thing but are different references.
 *
 * This hook does NOT run in production.
 */
const useDevCheckStable = (
  jsonSerializable: unknown,
  msg = "The value has changed. This may cause unnecessary re-renders",
) => {
  if (process.env.NODE_ENV !== "production") {
    /**
     * Calling hooks conditionally based on env vars is not really a problem.
     * In a given environment, the hook will always run or always not run.
     */
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const valRef = useRef(jsonSerializable)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const sameJson =
        JSON.stringify(valRef.current) === JSON.stringify(jsonSerializable)
      const differentRefs = valRef.current !== jsonSerializable
      if (!sameJson || differentRefs) {
        console.error(
          `useDevCheckStable: ${msg}`,
          valRef.current,
          jsonSerializable,
        )
      }
    }, [jsonSerializable, msg])
  }
}

export { useDevCheckStable }
