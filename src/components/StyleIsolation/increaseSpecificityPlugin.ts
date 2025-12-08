import type { StylisPlugin, StylisElement } from "@emotion/cache"

export const SPECIFICITY_INCREASE = 3

/**
 * Static class name used for style isolation.
 * The Stylis plugin automatically increases specificity for all styles
 * within elements with this class name.
 */
export const ISOLATION_CLASS_NAME = "Mit-isolated"

/**
 * Stylis plugin that increases CSS specificity by prepending a scope selector
 * to all rules within a StyleIsolation container.
 *
 * This automatically increases specificity for all styles within the scope,
 * ensuring they override conflicting parent page styles.
 *
 * @param scope - The CSS class selector to use as the scope (e.g., ".Mit-isolated")
 * @returns A Stylis plugin function
 */
export const increaseSpecificity: StylisPlugin = (element: StylisElement) => {
  const increaseSelector = `.${ISOLATION_CLASS_NAME}`.repeat(
    SPECIFICITY_INCREASE,
  )
  if (element.type === "rule" && Array.isArray(element.props)) {
    element.props = element.props.map((_selector: string) => {
      if (
        _selector.startsWith("@") ||
        _selector.startsWith(":root") ||
        _selector.includes(increaseSelector)
      ) {
        return _selector
      }
      return `${_selector}, ${increaseSelector} ${_selector}`
    })
  }
}
