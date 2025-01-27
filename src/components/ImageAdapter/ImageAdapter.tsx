import * as React from "react"
import { useTheme } from "@emotion/react"

/**
 * ImageAdapterPropsOverrides can be used with module augmentation to provide
 * extra props to ButtonLink.
 *
 * For example, in a NextJS App, you might set `next/image` as your default
 * image implementation, and use ImageAdapterPropsOverrides to provide
 * `next/image`-specific props.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImageAdapterPropsOverrides {}
type ImageAdapterProps = React.ComponentProps<"img"> & {
  Component?: React.ElementType
} & ImageAdapterPropsOverrides
/**
 * Overrideable Image component.
 * - If `Component` is provided, renders as `Component`
 * - else, if `theme.custom.ImageAdapter` is provided, renders as `theme.custom.ImageAdapter`
 * - else, renders as `img` tag
 */
const ImageAdapter = React.forwardRef<HTMLImageElement, ImageAdapterProps>(
  function ImageAdapter({ Component = "img", ...props }, ref) {
    const theme = useTheme()
    const ImgComponent = Component ?? theme.custom.LinkAdapter
    return <ImgComponent ref={ref} {...props} />
  },
)

export { ImageAdapter }
export type { ImageAdapterPropsOverrides, ImageAdapterProps }
