import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { default as emotionStyled } from "@emotion/styled"
import type { CreateStyled } from "@emotion/styled"
import type { CSSObject } from "@emotion/react"

/**
 * Context for providing the StyleIsolation container className to child components.
 * Components can use this className in their CSS selectors to target elements
 * within the StyleIsolation container without relying on specificity levels.
 */
const StyleIsolationContext = React.createContext<string | null>(null)

/**
 * Hook to wrap styles with StyleIsolation className for correct specificity.
 * When a component is inside StyleIsolation, this wraps styles with the isolation
 * className selector to override StyleIsolation's reset specificity (0,2,1).
 *
 * When isolationClassName is available, styles are wrapped as:
 * `.css-abc123 &&&& { ...styles }` (specificity: 0,4,0)
 *
 * This ensures component styles (0,4,0) override StyleIsolation's resets (0,2,1).
 * When isolationClassName is null/undefined, styles are returned as-is.
 *
 * This is used internally by components like Button to ensure their styles
 * properly override StyleIsolation's resets when inside a StyleIsolation container.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const Button = styled("button")((props) =>
 *     useStyleIsolation({
 *       backgroundColor: "red",
 *       padding: "8px 16px",
 *     })
 *   )
 *   return <Button>Click me</Button>
 * }
 * ```
 */
export const useStyleIsolation = (
  styles: CSSObject | Array<CSSObject | false | null | undefined>,
) => {
  const isolationClassName = React.useContext(StyleIsolationContext)
  if (!isolationClassName) {
    return styles
  }

  // If styles is an array, merge all valid CSS objects into a single object
  if (Array.isArray(styles)) {
    const mergedStyles: CSSObject = {}
    for (const style of styles) {
      // Skip falsy values (false, null, undefined) - these are used for conditional styles
      if (!style || typeof style !== "object") {
        continue
      }
      Object.assign(mergedStyles, style as CSSObject)
    }
    return {
      [`.${isolationClassName} &&&&`]: mergedStyles,
    }
  }

  // If styles is a single CSSObject, wrap it directly
  return {
    [`.${isolationClassName} &&&&`]: styles,
  }
}

/**
 * A wrapper around Emotion's styled() that automatically applies useStyleIsolation
 * to style callbacks when inside a StyleIsolation context. This ensures styles
 * automatically override StyleIsolation's resets without manual intervention.
 *
 * Usage is identical to Emotion's styled(). Styles are automatically wrapped
 * with the correct specificity when inside a StyleIsolation container.
 *
 * @example
 * ```tsx
 * import { styled } from "./StyleIsolation"
 *
 * const MyButton = styled("button")(({ theme }) => ({
 *   backgroundColor: theme.custom.colors.mitRed,
 *   padding: "8px 16px",
 * }))
 * ```
 */
export const styled: CreateStyled = new Proxy(
  emotionStyled as unknown as Record<string, unknown>,
  {
    get(target, prop) {
      const originalStyled = target[prop as string]
      if (typeof originalStyled !== "function") {
        return originalStyled
      }

      const wrapFunction = (fn: unknown): unknown => {
        if (typeof fn !== "function") {
          return fn
        }
        return (...args: unknown[]) => {
          // Check if the last argument is a style callback function
          if (args.length > 0 && typeof args[args.length - 1] === "function") {
            const originalCallback = args[args.length - 1] as (
              props: unknown,
            ) => unknown

            // Wrap the callback to automatically apply useStyleIsolation
            const wrappedCallback = ((props: unknown) => {
              const styles = originalCallback(props)

              // Apply useStyleIsolation if we're in a StyleIsolation context
              // This hook call happens during render, so context is available
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const wrapped = useStyleIsolation(styles as CSSObject)

              return wrapped
            }) as (props: unknown) => unknown

            // Copy function properties to maintain compatibility
            Object.setPrototypeOf(
              wrappedCallback,
              Object.getPrototypeOf(originalCallback),
            )
            Object.defineProperty(wrappedCallback, "length", {
              value: originalCallback.length,
              writable: false,
            })
            Object.defineProperty(wrappedCallback, "name", {
              value: originalCallback.name || "wrappedCallback",
              writable: false,
            })

            // Replace the callback in args and call the original function
            const newArgs = [...args]
            newArgs[newArgs.length - 1] = wrappedCallback
            return (fn as (...args: unknown[]) => unknown)(...newArgs)
          }

          // No style callback detected - this might be a component being wrapped
          // (e.g., styled(Button)) or a chained call (e.g., styled("button", config))
          const result = (fn as (...args: unknown[]) => unknown)(...args)

          // If result is a function (chained call or component wrapper), wrap it recursively
          // This handles cases like:
          // - styled("button", config) -> returns function that takes style callback
          // - styled(Button) -> returns function that takes style callback
          if (typeof result === "function") {
            return wrapFunction(result)
          }
          return result
        }
      }

      return wrapFunction(originalStyled as (...args: unknown[]) => unknown)
    },
    // Handle direct function calls like styled(Button)
    apply(target, thisArg, args) {
      // When styled is called directly (e.g., styled(Button)), wrap the result
      const result = (
        target as unknown as (...args: unknown[]) => unknown
      ).apply(thisArg, args)
      // If result is a function (component wrapper), wrap it recursively
      const wrapFunction = (fn: unknown): unknown => {
        if (typeof fn !== "function") {
          return fn
        }
        return (...innerArgs: unknown[]) => {
          // Check if the last argument is a style callback function
          if (
            innerArgs.length > 0 &&
            typeof innerArgs[innerArgs.length - 1] === "function"
          ) {
            const originalCallback = innerArgs[innerArgs.length - 1] as (
              props: unknown,
            ) => unknown

            // Wrap the callback to automatically apply useStyleIsolation
            const wrappedCallback = ((props: unknown) => {
              const styles = originalCallback(props)
              // eslint-disable-next-line react-hooks/rules-of-hooks
              return useStyleIsolation(styles as CSSObject)
            }) as (props: unknown) => unknown

            Object.setPrototypeOf(
              wrappedCallback,
              Object.getPrototypeOf(originalCallback),
            )
            Object.defineProperty(wrappedCallback, "length", {
              value: originalCallback.length,
              writable: false,
            })
            Object.defineProperty(wrappedCallback, "name", {
              value: originalCallback.name || "wrappedCallback",
              writable: false,
            })

            const newArgs = [...innerArgs]
            newArgs[newArgs.length - 1] = wrappedCallback
            return (fn as (...args: unknown[]) => unknown)(...newArgs)
          }

          const innerResult = (fn as (...args: unknown[]) => unknown)(
            ...innerArgs,
          )
          if (typeof innerResult === "function") {
            return wrapFunction(innerResult)
          }
          return innerResult
        }
      }
      if (typeof result === "function") {
        return wrapFunction(result)
      }
      return result
    },
  },
) as unknown as CreateStyled

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
   * Style overrides for the isolation container itself
   */
  sx?: CSSObject
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
const StyleIsolationRoot = emotionStyled.div<{
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

  // Build high-specificity resets for common elements
  // Based on common conflicts from MITx Online and similar LMS CSS files
  const commonResets: CSSObject = {
    // Use && to create selectors with higher specificity
    // This generates .css-abc123.css-abc123 button
    // Specificity: 0,2,1 (2 classes + 1 element)
    // This will override:
    // - form input[type="button"] (0,1,2) - higher specificity wins
    // - Most common parent page selectors
    // Components use .css-abc123 &&&& (0,4,0) via useStyleIsolation to override these resets
    // Consumers can use &&&&& (0,5,0) to override component styles
    "&&": {
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
    },
  }

  const customResetStyles: CSSObject = customResets
    ? Object.entries(customResets).reduce(
        (acc, [selector, styles]) => {
          // Apply moderate specificity to custom selectors
          // Note: Custom resets use & (0,1,1) while common resets use && (0,2,1)
          // Components use .css-abc123 &&&& (0,4,0) via useStyleIsolation to override
          acc[`& ${selector}`] = styles
          return acc
        },
        {} as Record<string, CSSObject>,
      )
    : {}

  return {
    ...baseStyles,
    ...commonResets,
    ...customResetStyles,
    ...sx,
  }
})

const StyleIsolation: React.FC<StyleIsolationProps> = ({
  children,
  className,
  sx,
  customResets,
}) => {
  const [isolationClassName, setIsolationClassName] = React.useState<
    string | null
  >(null)

  // Callback ref to capture the Emotion-generated className
  const handleRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        const classList = Array.from(element.classList)

        // Emotion generates classNames that start with 'css-'
        // Find the first Emotion-generated className (not user-provided)
        const emotionClassName = classList.find((cls) => cls.startsWith("css-"))
        if (emotionClassName) {
          setIsolationClassName(emotionClassName)
        } else if (classList.length > 0) {
          // Fallback: use the first className if no css- prefix found
          // This adds tolerance in case Emotion uses a different format
          const firstClassName = classList[0]
          if (firstClassName !== className) {
            setIsolationClassName(firstClassName)
          }
        }
      }
    },
    [className],
  )

  return (
    <StyleIsolationContext.Provider value={isolationClassName}>
      <StyleIsolationRoot
        ref={handleRef}
        className={className}
        customResets={customResets}
        sx={sx}
      >
        {children}
      </StyleIsolationRoot>
    </StyleIsolationContext.Provider>
  )
}

StyleIsolation.displayName = "StyleIsolation"

export { StyleIsolation }
export type { StyleIsolationProps }
