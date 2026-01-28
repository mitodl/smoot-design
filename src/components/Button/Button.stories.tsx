import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { Button, ButtonLink, ButtonLoadingIcon } from "./Button"
import type { ButtonProps } from "./Button"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiTestTubeLine,
  RiMailLine,
} from "@remixicon/react"

import { fn } from "storybook/test"
import { enumValues } from "../../story-utils"

const ICONS = {
  None: undefined,
  ArrowBackIcon: <RiArrowLeftLine />,
  DeleteIcon: <RiDeleteBinLine />,
  TestTubeIcon: <RiTestTubeLine />,
}

const VARIANTS = enumValues<ButtonProps["variant"]>({
  primary: true,
  secondary: true,
  tertiary: true,
  bordered: true,
  text: true,
})
const STABLE_VARIANTS = VARIANTS.filter((v) => !v.startsWith("unstable"))
const SIZES = enumValues<ButtonProps["size"]>({
  small: true,
  medium: true,
  large: true,
})
const EDGES = enumValues<ButtonProps["edge"]>({
  circular: true,
  rounded: true,
  none: true,
})

const meta: Meta<typeof Button> = {
  title: "smoot-design/Button",
  component: Button,
  argTypes: {
    startIcon: {
      options: Object.keys(ICONS),
      mapping: ICONS,
    },
    endIcon: {
      options: Object.keys(ICONS),
      mapping: ICONS,
    },
  },
  args: {
    onClick: fn(),
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const VariantsAndEdge: Story = {
  render: (args) => (
    <>
      <Stack direction="row" gap={2} sx={{ my: 2 }}>
        <Button edge="none" variant="primary" {...args}>
          Primary
        </Button>
        <Button edge="none" variant="secondary" {...args}>
          Secondary
        </Button>
        <Button edge="none" variant="tertiary" {...args}>
          Tertiary
        </Button>
        <Button edge="none" variant="bordered" {...args}>
          Bordered
        </Button>
        <Button edge="none" variant="text" {...args}>
          Text
        </Button>
      </Stack>
      <Stack direction="row" gap={2} sx={{ my: 2 }}>
        <Button edge="rounded" variant="primary" {...args}>
          Primary
        </Button>
        <Button edge="rounded" variant="secondary" {...args}>
          Secondary
        </Button>
        <Button edge="rounded" variant="tertiary" {...args}>
          Tertiary
        </Button>
        <Button edge="rounded" variant="bordered" {...args}>
          Bordered
        </Button>
        <Button edge="rounded" variant="text" {...args}>
          Text
        </Button>
      </Stack>
      <Stack direction="row" gap={2} sx={{ my: 2 }}>
        <Button edge="circular" variant="primary" {...args}>
          Primary
        </Button>
        <Button edge="circular" variant="secondary" {...args}>
          Secondary
        </Button>
        <Button edge="circular" variant="tertiary" {...args}>
          Tertiary
        </Button>
        <Button edge="circular" variant="bordered" {...args}>
          Bordered
        </Button>
        <Button edge="circular" variant="text" {...args}>
          Text
        </Button>
      </Stack>
    </>
  ),
  tags: ["main"],
}

const RESPONSIVE = [true, false]

export const Sizes: Story = {
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => (
    <Grid container sx={{ my: 2, maxWidth: "600px" }} alignItems="center">
      {RESPONSIVE.flatMap((responsive) => {
        return (
          <React.Fragment key={String(responsive)}>
            <Grid size={{ xs: 12 }}>
              <code>{`responsive={${responsive.toString()}}`}</code>
            </Grid>
            {SIZES.map((size) => (
              <Grid
                size={{ xs: 4 }}
                gap={2}
                display="flex"
                alignItems="center"
                key={size}
              >
                <Button {...args} size={size} responsive={responsive}>
                  {size}
                </Button>
              </Grid>
            ))}
          </React.Fragment>
        )
      })}
    </Grid>
  ),
}

export const WithLoadingSpinner: Story = {
  render: (args) => (
    <Stack direction="row" justifyContent="space-around">
      <Stack direction="column" alignItems="end" gap={2} sx={{ my: 2 }}>
        <Button {...args} variant="primary" endIcon={<ButtonLoadingIcon />}>
          Primary
        </Button>
        <Button {...args} variant="secondary" endIcon={<ButtonLoadingIcon />}>
          Secondary
        </Button>
        <Button {...args} variant="tertiary" endIcon={<ButtonLoadingIcon />}>
          Tertiary
        </Button>
      </Stack>
      <Stack direction="column" alignItems="end" gap={2} sx={{ my: 2 }}>
        <Button
          {...args}
          disabled
          variant="primary"
          endIcon={<ButtonLoadingIcon />}
        >
          Primary
        </Button>
        <Button
          {...args}
          disabled
          variant="secondary"
          endIcon={<ButtonLoadingIcon />}
        >
          Secondary
        </Button>
        <Button
          {...args}
          disabled
          variant="tertiary"
          endIcon={<ButtonLoadingIcon />}
        >
          Tertiary
        </Button>
      </Stack>
    </Stack>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <Stack direction="row" justifyContent="space-around">
      <Stack direction="column" alignItems="start" gap={2} sx={{ my: 2 }}>
        {Object.entries(ICONS).map(([key, icon]) => (
          <Button {...args} startIcon={icon} key={key}>
            {key}
          </Button>
        ))}
      </Stack>
      <Stack direction="column" alignItems="end" gap={2} sx={{ my: 2 }}>
        {Object.entries(ICONS).map(([key, icon]) => (
          <Button {...args} endIcon={icon} key={key}>
            {key}
          </Button>
        ))}
      </Stack>
    </Stack>
  ),
}

const EXTRA_PROPS = [
  {},
  /**
   * Show RiTestTubeLine because it is a fairly thin icon
   */
  { startIcon: <RiTestTubeLine /> },
  /**
   * Show RiTestTubeLine because it is a fairly thick icon
   */
  { startIcon: <RiMailLine /> },
  { endIcon: <RiTestTubeLine /> },
  { endIcon: <RiMailLine /> },
]

/**
 * `ButtonLink` is a styled `Button` that renders an anchor tag.
 *
 * To use a custom link component (E.g. `Link` from `react-router` or `next/link`),
 * pass it as the `Component` prop. Alternatively, customize the project-wide
 * default link adapter via [Theme's LinkAdapter](../?path=/docs/smoot-design-themeprovider--docs)
 */
export const Links: Story = {
  render: () => (
    <Stack direction="row" gap={2} sx={{ my: 2 }}>
      <ButtonLink href="#fake" variant="primary">
        Link
      </ButtonLink>
      <ButtonLink href="#fake" variant="secondary">
        Link
      </ButtonLink>
      <ButtonLink href="#fake" variant="tertiary">
        Link
      </ButtonLink>
      <ButtonLink href="#fake" variant="bordered">
        Link
      </ButtonLink>
      <ButtonLink href="#fake" variant="text">
        Link
      </ButtonLink>
    </Stack>
  ),
}
export const Showcase: Story = {
  render: (args) => (
    <Grid container rowGap={2} sx={{ maxWidth: "600px" }}>
      {STABLE_VARIANTS.flatMap((variant) =>
        EDGES.flatMap((edge) =>
          EXTRA_PROPS.map((extraProps, i) => {
            return (
              <React.Fragment key={`${variant}-${edge}-${i}`}>
                <Grid size={{ xs: 3 }}>
                  <pre>
                    variant={variant}
                    <br />
                    edge={edge}
                  </pre>
                </Grid>
                {SIZES.map((size) => (
                  <Grid
                    size={{ xs: 3 }}
                    display="flex"
                    alignItems="center"
                    key={`${size}`}
                  >
                    <Button
                      {...args}
                      variant={variant}
                      edge={edge}
                      size={size}
                      {...extraProps}
                    >
                      {args.children}
                    </Button>
                  </Grid>
                ))}
              </React.Fragment>
            )
          }),
        ),
      )}
    </Grid>
  ),
  args: {
    children: "Click me",
  },
}
