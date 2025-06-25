import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider, createTheme } from "./ThemeProvider"
import { ButtonLink } from "../Button/Button"

const CustomLinkAdapater = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>((props, ref) => (
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  <a
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      alert(`Custom link to: ${e.currentTarget.href}. (Preventing Navigation.)`)
    }}
    data-custom="theme-default"
    {...props}
  />
))
CustomLinkAdapater.displayName = "CustomLinkAdapter"

const customTheme = createTheme({
  custom: {
    LinkAdapter: CustomLinkAdapater,
  },
})

const meta: Meta<typeof ThemeProvider> = {
  title: "smoot-design/ThemeProvider",
  component: ThemeProvider,
  argTypes: {
    theme: {
      options: ["Default", "Custom Link Adapter"],
      mapping: {
        Default: undefined,
        "Custom Link Adapter": customTheme,
      },
    },
    children: {
      table: { disable: true },
    },
  },
  id: "smoot-design/ThemeProvider",
}

type Story = StoryObj<typeof ThemeProvider>

/**
 * `ThemeProvider` must wrap all components from `smoot`-design, and allows
 *  styling any component via [`styled`](https://emotion.sh/docs/styled).
 *
 * In general, most useful theme properties are exposed on `theme.custom`. (Root
 * `theme` properties are used internally by MUI.) See typescript definitions
 * for more information about `theme.custom`.
 *
 * ## Further Customized Theme with `createTheme`
 * Consuming applications can customize `smoot-design`'s default theme by creating
 * a theme instance with `createTheme` and passing it to `ThemeProvider`:
 *
 * ```tsx
 * const customTheme = createTheme({...})
 *
 * <ThemeProvider theme={customTheme}>
 *   {children}
 * </ThemeProvider>
 * ```
 *
 * ### Custom Link Adapter
 * One particularly notable property is `theme.custom.LinkAdapter`. Some `smoot-design`
 * components render links. These links are native anchor tags by default. In
 * order to use these components with custom routing libraries (e.g. `react-router`
 * or `next/link`), you can provide a custom link adapter.
 *
 * Components such as `ButtonLink` will:
 *   - use `Component` on `ButtonLink` if specified (`<ButtonLink Component={Link} />`)
 *   - else, use `theme.custom.LinkAdapter` if specified,
 *   - else, use `a` tag.
 *
 * For example, to use `next/link` as the default link implementation:
 *
 * ```tsx
 * import Link from "next/link"
 * const theme = createTheme({ LinkAdapter: Link })
 * ```
 *
 * You can use [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
 * to add the custom props to relevant components. For example, to expose
 * `next/link`'s `scroll` prop on `ButtonLink`:
 *
 * ```ts
 * // Add scroll prop to all components using LinkAdapter
 * declare module "@mitodl/smoot-design" {
 *   interface LinkAdapterPropsOverrides {
 *     scroll?: boolean
 *   }
 * }
 * ```
 *
 * ### ImageAdapter
 * Similarly, `theme.custom.ImageAdapter` can be used to customize the image
 * component used by `smoot-design`. By default, `ImageAdapter` uses a simple `img`
 * tag. Interface `ImageAdapterPropsOverrides` is similarly available for
 * augmentation.
 */
export const LinkAdapterOverride: Story = {
  args: {
    theme: customTheme,
  },
  render: (args) => {
    return (
      <ThemeProvider theme={args.theme}>
        <ButtonLink href="https://mit.edu">
          {args.theme ? "Custom theme in use" : "Default theme in use"}
        </ButtonLink>
      </ThemeProvider>
    )
  },
}

export default meta
