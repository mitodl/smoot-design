/**
 * jsdom implements no matchMedia at all, and MUI's useMediaQuery falls back to
 * `defaultMatches: false` when it is missing -- so without this every
 * below-breakpoint assertion would pass against the desktop branch and prove
 * nothing.
 */

const DEFAULT_WIDTH = 1024

type Listener = (event: MediaQueryListEvent) => void

let width = DEFAULT_WIDTH
const subscribers = new Set<{ query: string; listener: Listener }>()

const readFeature = (query: string, feature: string) => {
  const match = new RegExp(`\\(\\s*${feature}\\s*:\\s*([\\d.]+)px\\s*\\)`).exec(
    query,
  )
  return match ? Number(match[1]) : null
}

const evaluate = (query: string) => {
  const max = readFeature(query, "max-width")
  const min = readFeature(query, "min-width")
  // Fail closed. Only width is modelled here, so reporting a match for
  // something like (prefers-reduced-motion: reduce) would be a guess.
  if (max === null && min === null) {
    return false
  }
  return (max === null || width <= max) && (min === null || width >= min)
}

const installMatchMedia = () => {
  window.matchMedia = (query: string): MediaQueryList => {
    const subscribe = (listener: Listener) => {
      subscribers.add({ query, listener })
    }
    const unsubscribe = (listener: Listener) => {
      subscribers.forEach((entry) => {
        if (entry.query === query && entry.listener === listener) {
          subscribers.delete(entry)
        }
      })
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
        subscribe(listener as Listener),
      removeEventListener: (_type: string, listener: EventListener) =>
        unsubscribe(listener as Listener),
      addListener: subscribe,
      removeListener: unsubscribe,
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
  }
}

const setViewportWidth = (next: number) => {
  width = next
  subscribers.forEach(({ query, listener }) =>
    listener({ matches: evaluate(query), media: query } as MediaQueryListEvent),
  )
}

const resetViewport = () => {
  width = DEFAULT_WIDTH
  subscribers.clear()
}

export { installMatchMedia, setViewportWidth, resetViewport }
