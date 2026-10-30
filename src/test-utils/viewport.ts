/**
 * jsdom implements no matchMedia at all, and MUI's useMediaQuery falls back to
 * `defaultMatches: false` when it is missing -- so without this every
 * below-breakpoint assertion would pass against the desktop branch and prove
 * nothing.
 */

const DEFAULT_WIDTH = 1024

let width = DEFAULT_WIDTH
const listeners = new Set<(event: MediaQueryListEvent) => void>()

const readFeature = (query: string, feature: string) => {
  const match = new RegExp(`\\(\\s*${feature}\\s*:\\s*([\\d.]+)px\\s*\\)`).exec(
    query,
  )
  return match ? Number(match[1]) : null
}

const evaluate = (query: string) => {
  const max = readFeature(query, "max-width")
  const min = readFeature(query, "min-width")
  return (max === null || width <= max) && (min === null || width >= min)
}

const installMatchMedia = () => {
  window.matchMedia = (query: string): MediaQueryList => {
    const subscribe = (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    }
    const unsubscribe = (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    }
    return {
      // A getter, not a snapshot: useMediaQuery reads `matches` on every render
      // and would otherwise keep the value from the width at subscribe time.
      get matches() {
        return evaluate(query)
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListener) =>
        subscribe(listener as (event: MediaQueryListEvent) => void),
      removeEventListener: (_type: string, listener: EventListener) =>
        unsubscribe(listener as (event: MediaQueryListEvent) => void),
      addListener: subscribe,
      removeListener: unsubscribe,
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
  }
}

const setViewportWidth = (next: number) => {
  width = next
  listeners.forEach((listener) =>
    listener({ matches: true, media: "" } as MediaQueryListEvent),
  )
}

const resetViewport = () => {
  width = DEFAULT_WIDTH
  listeners.clear()
}

export { installMatchMedia, setViewportWidth, resetViewport, DEFAULT_WIDTH }
