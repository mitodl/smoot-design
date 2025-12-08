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
  sx?: CSSObject
}>(({ customResets, sx }) => {
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
     * Creates a new stacking context and isolates the element from its siblings
     * in terms of z-index and positioning. More importantly for our use case,
     * it creates a new containing block for positioned descendants.
     *
     * Benefits:
     * - Creates a new stacking context (useful for z-index isolation)
     * - Helps with positioning context isolation
     * - Works together with contain: "style" for better isolation
     *
     * Note: This is primarily for layout/positioning isolation, but complements
     * contain: "style" for comprehensive isolation. The real protection against
     * parent CSS comes from the && high-specificity selectors below.
     */
    isolation: "isolate",
  }

  // Build resets for common elements
  // Based on common conflicts from MITx Online and similar LMS CSS files
  const resets: CSSObject = {
    // The Stylis plugin will automatically prepend .Mit-isolated.Mit-isolated.Mit-isolated
    // to all selectors, resulting in:
    // .Mit-isolated.Mit-isolated.Mit-isolated button (0,3,1)
    // Component styles will also get the plugin treatment, resulting in:
    // .css-abc123, .Mit-isolated.Mit-isolated.Mit-isolated .css-abc123 button (0,5,1)
    // This ensures component styles (0,5,1) override parent page styles but
    // can still be overridden by the resets if needed
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
    ...baseStyles,
    ...resets,
    ...sx,
  }
})

const StyleIsolation: React.FC<StyleIsolationProps> = ({
  children,
  className,
  customResets,
}) => {
  // Create an Emotion cache with the Stylis plugin that increases specificity
  // for all styles within the isolation container.
  // Include prefixer to preserve Emotion's default vendor prefixing behavior.
  const cache = React.useMemo(
    () =>
      createCache({
        key: "mit-isolated",
        stylisPlugins: [prefixer, increaseSpecificity],
      }),
    [],
  )

  const combinedClassName = React.useMemo(() => {
    const classes = [ISOLATION_CLASS_NAME]
    if (className) {
      classes.push(className)
    }
    return classes.join(" ")
  }, [className])

  return (
    <CacheProvider value={cache}>
      <StyleIsolationRoot
        className={combinedClassName}
        customResets={customResets}
      >
        {children}
      </StyleIsolationRoot>
    </CacheProvider>
  )
}

StyleIsolation.displayName = "StyleIsolation"

export { StyleIsolation }
export type { StyleIsolationProps }
