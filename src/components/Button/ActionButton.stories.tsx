import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ActionButton, ActionButtonLink, DEFAULT_PROPS } from "./ActionButton"
import type { ActionButtonProps } from "./ActionButton"
import Grid from "@mui/material/Grid2"
import Stack from "@mui/material/Stack"
import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiTestTubeLine,
} from "@remixicon/react"

import { fn } from "@storybook/test"
import { enumValues } from "@/story-utils"

const ICONS = {
  None: undefined,
  ArrowBackIcon: <RiArrowLeftLine />,
  DeleteIcon: <RiDeleteBinLine />,
  TestTubeIcon: <RiTestTubeLine />,
}

const VARIANTS = enumValues<NonNullable<ActionButtonProps["variant"]>>({
  primary: true,
  secondary: true,
  tertiary: true,
  text: true,
  unstable_noBorder: true,
  unstable_inverted: true,
  unstable_success: true,
})
const STABLE_VARIANTS = VARIANTS.filter((v) => !v.startsWith("unstable"))
const SIZES = enumValues<NonNullable<ActionButtonProps["size"]>>({
  small: true,
  medium: true,
  large: true,
})
const EDGES = enumValues<NonNullable<ActionButtonProps["edge"]>>({
  circular: true,
  rounded: true,
  none: true,
})

const meta: Meta<typeof ActionButton> = {
  title: "smoot-design/ActionButton",
  component: ActionButton,
  argTypes: {
    variant: {
      control: { type: "select" },
      table: {
        defaultValue: { summary: DEFAULT_PROPS.variant },
      },
    },
    size: {
      control: { type: "select" },
      table: {
        defaultValue: { summary: DEFAULT_PROPS.size },
      },
    },
    edge: {
      control: { type: "select" },
      table: {
        defaultValue: { summary: DEFAULT_PROPS.edge },
      },
    },
  },
  args: {
    onClick: fn(),
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof ActionButton>

export const VariantsAndEdge: Story = {
  render: (args) => (
    <>
      <Stack direction="row" gap={2} sx={{ my: 2 }}>
        <ActionButton {...args} edge="none" variant="primary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="none" variant="secondary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="none" variant="tertiary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="none" variant="text">
          {ICONS.DeleteIcon}
        </ActionButton>
      </Stack>
      <Stack direction="row" gap={2} sx={{ my: 2 }}>
        <ActionButton {...args} edge="rounded" variant="primary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="rounded" variant="secondary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="rounded" variant="tertiary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="rounded" variant="text">
          {ICONS.DeleteIcon}
        </ActionButton>
      </Stack>
      <Stack direction="row" gap={2} sx={{ my: 2 }}>
        <ActionButton {...args} edge="circular" variant="primary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="circular" variant="secondary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="circular" variant="tertiary">
          {ICONS.DeleteIcon}
        </ActionButton>
        <ActionButton {...args} edge="circular" variant="text">
          {ICONS.DeleteIcon}
        </ActionButton>
      </Stack>
    </>
  ),
  tags: ["main"],
}

export const Showcase: Story = {
  render: (args) => (
    <Grid container sx={{ maxWidth: "750px" }} rowGap={2}>
      {STABLE_VARIANTS.flatMap((variant) =>
        EDGES.flatMap((edge) => (
          <React.Fragment key={`${variant}-${edge}`}>
            <Grid size={{ xs: 12, sm: 3 }} alignItems="center">
              <code>
                variant={variant}
                <br />
                edge={edge}
              </code>
            </Grid>
            {SIZES.flatMap((size) =>
              Object.entries(ICONS)
                .filter(([_key, icon]) => icon)
                .map(([iconKey, icon]) => (
                  <Grid size={{ xs: 4, sm: 1 }} key={`${size}-${iconKey}`}>
                    <ActionButton
                      variant={variant}
                      edge={edge}
                      size={size}
                      {...args}
                    >
                      {icon}
                    </ActionButton>
                  </Grid>
                )),
            )}
          </React.Fragment>
        )),
      )}
    </Grid>
  ),
}

/**
 * `ActionButtonLink` is styled as a `ActionButton` that renders an anchor tag.
 *
 * To use a custom link component (E.g. `Link` from `react-router` or `next/link`),
 * pass it as the `Component` prop. Alternatively, customize the project-wide
 * default link adapter via [Theme's LinkAdapter](../?path=/docs/smoot-design-themeprovider--docs)
 */
export const Links: Story = {
  render: () => (
    <Stack direction="row" gap={2} sx={{ my: 2 }}>
      <ActionButtonLink href="#fake" variant="primary">
        {ICONS.DeleteIcon}
      </ActionButtonLink>
      <ActionButtonLink href="#fake" variant="secondary">
        {ICONS.DeleteIcon}
      </ActionButtonLink>
      <ActionButtonLink href="#fake" variant="tertiary">
        {ICONS.DeleteIcon}
      </ActionButtonLink>
      <ActionButtonLink href="#fake" variant="text">
        {ICONS.DeleteIcon}
      </ActionButtonLink>
    </Stack>
  ),
}
