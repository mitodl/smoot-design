import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import type { TypographyProps } from "@mui/material/Typography"

/**
 * Typography styles can be controlled via the `theme.typography` object when
 * using the `styled` helper or via the `<Tyopgraphy variant="..." />` component.
 *
 * ```tsx
 * const MyHeading = styled(({ theme }) => ({
 *   ...theme.typography.h2,
 *   [theme.breakpoints.down("sm")]: {
 *     ...theme.typography.h3,
 *   },
 * }))
 *
 * // or:
 * <Typography component="h1" typography={
 *   {
 *     xs: "h3",  // above xs
 *     sm: "h2"   // above sm
 *   }
 * }>
 * Hello, world!
 * </Typography>
 * ```
 *
 */
const meta: Meta<typeof Typography> = {
  title: "smoot-design/Typography",
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Typography>

const text = "The quick brown fox jumps over the lazy dog. ".repeat(10)
const INSTANCES: TypographyProps[] = [
  { variant: "h1", children: "Heading level 1" },
  { variant: "h2", children: "Heading level 2" },
  { variant: "h3", children: "Heading level 3" },
  { variant: "h4", children: "Heading level 4" },
  { variant: "h5", children: "Heading level 5" },
  { variant: "subtitle1", children: "Subtitle level 1" },
  { variant: "subtitle2", children: "Subtitle level 2" },
  { variant: "subtitle3", children: "Subtitle level 3" },
  { variant: "subtitle4", children: "Subtitle level 4" },
  { variant: "body1", children: `body level 1... ${text}` },
  { variant: "body2", children: `body level 2... ${text}` },
  { variant: "body3", children: `body level 3... ${text}` },
  { variant: "body4", children: `body level 4... ${text}` },
]

/**
 * Typography variants are shown below.
 *
 * **Note:** The typography variant is not related to the HTML element used. A
 * `variant="h1"` component does not automatically render an `<h1>` element.
 *
 */
export const Variants: Story = {
  render: () => {
    return (
      <Stack gap="1rem">
        {INSTANCES.map((props) => (
          <Typography key={props.variant} {...props} />
        ))}
      </Stack>
    )
  },
}
