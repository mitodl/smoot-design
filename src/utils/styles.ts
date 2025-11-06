import type { CSSObject } from "@emotion/react"

/**
 * Helper to create style overrides for Button components with correct specificity.
 * Use this when extending Button or ActionButton with styled().
 *
 * const MyButton = styled(Button)(({ theme }) =>
 *   withStyleOverrides({
 *     borderRadius: "8px",
 *     backgroundColor: theme.custom.colors.blue,
 *   })
 * )
 */
export const withStyleOverrides = (styles: CSSObject) => ({
  "&&": styles,
})
