import * as React from "react"
import styled from "@emotion/styled"
import type { CSSObject } from "@emotion/react"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"
// stylis is provided by @emotion/cache and we can ensure version match with transitive dependency
// eslint-disable-next-line import/no-extraneous-dependencies
import { prefixer } from "stylis"
import {
  increaseSpecificity,
  ISOLATION_CLASS_NAME,
  SPECIFICITY_INCREASE,
} from "./increaseSpecificityPlugin"

type StyleIsolationProps = {
  /**
   * Child components to protect from parent CSS conflicts
   */
  children: React.ReactNode
  /**
   * CSS class name to apply to the isolation container
   */
  className?: string
  /**
   * Custom CSS resets to apply to specific selectors within the container.
   * Keys are CSS selectors, values are style objects.
   *
   * Example:
   * ```tsx
   * <StyleIsolation
   *   customResets={{
   *     "button": { border: "none", padding: 0 },
   *     ".custom-class": { color: "red" }
   *   }}
   * >
   *   <Button>Click me</Button>
   * </StyleIsolation>
   * ```
   */
  customResets?: Record<string, CSSObject>
  /**
   * Whether the container creates its own stacking context. Defaults to true.
   *
   * The context it creates sits at `z-index: auto` in the host page, so a host
   * element at any higher level paints over everything inside and no z-index
   * within can raise it. A fixed-position child that has to outrank host
   * content needs this off, so its own z-index competes in the host page.
   */
  isolateStacking?: boolean
}

/**
 * StyleIsolation provides a wrapper that protects child components from
 * conflicting parent page styles using high-specificity CSS overrides.
 *
 * This is useful when embedding components in pages with existing CSS that
 * might conflict with component styles.
 *
 * @example
 * ```tsx
 * <StyleIsolation>
 *   <Button>Click me</Button>
 *   <Input placeholder="Enter text" />
 * </StyleIsolation>
 * ```
 *
 * @example With custom resets
 * ```tsx
 * <StyleIsolation
 *   customResets={{
 *     "button": { border: "none" },
 *     "input": { fontSize: "16px" }
 *   }}
 * >
 *   <Button>Click me</Button>
 * </StyleIsolation>
 * ```
 */
const StyleIsolationRoot = styled.div<{
  customResets?: Record<string, CSSObject>
  isolateStacking?: boolean
  sx?: CSSObject
}>(({ customResets, isolateStacking = true, sx }) => {
  const baseStyles: CSSObject = {
    /* CSS Containment: contain: "style"
     *
     * This tells the browser that styles defined inside this element should not
     * affect elements outside of it, and styles from outside should not affect
     * elements inside (except through inheritance, which we handle with &&&&).
     *
     * Benefits:
     * - Creates a style boundary - prevents style leakage in/out
     * - Browser can optimize rendering by isolating style calculations
     * - Helps prevent accidental style conflicts
     *
     * Note: This doesn't prevent parent selectors like ".parent button" from
     * matching children, but it does prevent style inheritance issues and
     * helps the browser optimize. We still need &&&& for specificity overrides.
     */
    contain: "style",

    /* CSS Isolation: isolation: "isolate"
     *
     * Creates a new stacking context, so z-indexes set inside order only
     * against each other rather than against host page content. It does NOT
     * create a containing block -- `position: fixed` descendants still resolve
     * against the viewport.
     *
     * The real protection against parent CSS comes from the && high-specificity
     * selectors below, not from this. Turn it off (isolateStacking={false})
     * when a child has to outrank host content; see the prop docs above.
     */
    ...(isolateStacking ? { isolation: "isolate" as const } : {}),
  }

  // Build resets for common elements
  const resets: CSSObject = {
    "button, input[type='button']": {
      backgroundImage: "unset",
      textTransform: "unset",
      letterSpacing: "unset",
      textDecoration: "unset",
      textShadow: "unset",
      boxShadow: "unset",
      backgroundClip: "unset",
      verticalAlign: "unset",
      background: "unset",
      border: "unset",
    },

    "input, input[type='text'], input[type='email'], input[type='password'], input[type='number'], input[type='search'], input[type='tel'], input[type='url']":
      {
        background: "unset",
        backgroundImage: "unset",
        border: "unset",
        boxShadow: "unset",
        verticalAlign: "unset",
      },

    "input[type='submit'], input[type='reset']": {
      background: "unset",
      backgroundImage: "unset",
      border: "unset",
      boxShadow: "unset",
      verticalAlign: "unset",
    },

    "input:disabled": {
      background: "unset",
      backgroundImage: "unset",
      border: "unset",
      boxShadow: "unset",
    },

    "input:focus": {
      background: "unset",
      backgroundImage: "unset",
      border: "unset",
      boxShadow: "unset",
    },

    textarea: {
      background: "unset",
      backgroundImage: "unset",
      border: "unset",
      boxShadow: "unset",
      verticalAlign: "unset",
    },

    "textarea:disabled": {
      background: "unset",
      backgroundImage: "unset",
      border: "unset",
      boxShadow: "unset",
    },

    "textarea:focus": {
      background: "unset",
      backgroundImage: "unset",
      border: "unset",
      boxShadow: "unset",
    },

    "button:hover:not(:disabled), input[type='button']:hover:not(:disabled), input[type='submit']:hover:not(:disabled), input[type='reset']:hover:not(:disabled)":
      {
        background: "unset",
        border: "unset",
        boxShadow: "unset",
        backgroundImage: "unset",
        textTransform: "unset",
        textDecoration: "unset",
        textShadow: "unset",
      },

    "button:active:not(:disabled), button:focus:not(:disabled), input[type='button']:active:not(:disabled), input[type='button']:focus:not(:disabled), input[type='submit']:active:not(:disabled), input[type='submit']:focus:not(:disabled), input[type='reset']:active:not(:disabled), input[type='reset']:focus:not(:disabled)":
      {
        background: "unset",
        border: "unset",
        boxShadow: "unset",
        backgroundImage: "unset",
        textTransform: "unset",
        textDecoration: "unset",
        textShadow: "unset",
      },

    a: {
      textDecoration: "unset",
      textShadow: "unset",
    },

    "h1, h2, h3, h4, h5, h6": {
      textDecoration: "unset",
      verticalAlign: "unset",
    },

    p: {
      textDecoration: "unset",
      verticalAlign: "unset",
    },
    // Apply customResets with higher specificity (one more &) to ensure they override defaults
    "&": { ...(customResets || {}) },
  }

  return {
    ["&".repeat(SPECIFICITY_INCREASE)]: {
      ...baseStyles,
      ...resets,
      ...sx,
    },
  }
})

const StyleIsolation = React.forwardRef<HTMLDivElement, StyleIsolationProps>(
  ({ children, className, customResets, isolateStacking }, ref) => {
    /* Create an Emotion cache with the Stylis plugin that increases specificity
     * for all styles within the isolation container.
     * Include prefixer to preserve Emotion's default vendor prefixing behavior.
     */
    const cache = React.useMemo(
      () =>
        createCache({
          key: "mit-isolated",
          stylisPlugins: [prefixer, increaseSpecificity],
        }),
      [],
    )

    return (
      <CacheProvider value={cache}>
        <StyleIsolationRoot
          ref={ref}
          className={
            className
              ? `${ISOLATION_CLASS_NAME} ${className}`
              : ISOLATION_CLASS_NAME
          }
          customResets={customResets}
          isolateStacking={isolateStacking}
        >
          {children}
        </StyleIsolationRoot>
      </CacheProvider>
    )
  },
)

StyleIsolation.displayName = "StyleIsolation"

export { StyleIsolation }
export type { StyleIsolationProps }
