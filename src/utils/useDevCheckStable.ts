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
  const valRef = useRef(jsonSerializable)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
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
    }
  }, [jsonSerializable, msg])
}

export { useDevCheckStable }
