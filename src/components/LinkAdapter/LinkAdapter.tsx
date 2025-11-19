import * as React from "react"
import { useTheme } from "@emotion/react"
import { styled } from "../StyleIsolation/StyleIsolation"

const PlainLink = styled.a({
  color: "inherit",
  textDecoration: "none",
})

/**
 * LinkAdapterPropsOverrides can be used with module augmentation to provide
 * extra props to ButtonLink.
 *
 * For example, in a NextJS App, you might set `next/link` as your default
 * Link implementation, and use LinkAdapterPropsOverrides to provide
 * `next/link`-specific props.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LinkAdapterPropsOverrides {}
type LinkAdapterProps = React.ComponentProps<"a"> & {
  Component?: React.ElementType
} & LinkAdapterPropsOverrides
/**
 * Overrideable link component.
 * - If `Component` is provided, renders as `Component`
 * - else, if `theme.custom.LinkAdapter` is provided, renders as `theme.custom.LinkAdapter`
 * - else, renders as `a` tag
 */
const LinkAdapter = React.forwardRef<HTMLAnchorElement, LinkAdapterProps>(
  function LinkAdapter({ Component, ...props }, ref) {
    const theme = useTheme()
    const LinkComponent = Component ?? theme.custom.LinkAdapter
    return (
      <PlainLink as={LinkComponent} ref={ref} {...props}>
        {props.children}
      </PlainLink>
    )
  },
)

export { LinkAdapter }
export type { LinkAdapterPropsOverrides, LinkAdapterProps }
