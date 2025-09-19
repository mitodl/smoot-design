import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import styled from "@emotion/styled"
import { Input, AdornmentButton } from "./Input"
import type { InputProps } from "./Input"
import Stack from "@mui/material/Stack"
import Grid from "@mui/material/Grid2"
import { RiCalendarLine, RiCloseLine, RiSearchLine } from "@remixicon/react"
import { fn } from "storybook/test"
import { enumValues } from "../../story-utils"
import Typography from "@mui/material/Typography"

const SIZES = enumValues<NonNullable<InputProps["size"]>>({
  small: true,
  medium: true,
  large: true,
  chat: true,
  hero: true,
})

const ADORNMENTS = {
  None: undefined,
  SearchIcon: (
    <AdornmentButton>
      <RiSearchLine />
    </AdornmentButton>
  ),
  CalendarTodayIcon: (
    <AdornmentButton>
      <RiCalendarLine />
    </AdornmentButton>
  ),
  CloseIcon: (
    <AdornmentButton>
      <RiCloseLine />
    </AdornmentButton>
  ),
  "Close and Calendar": (
    <>
      <AdornmentButton>
        <RiCloseLine />
      </AdornmentButton>
      <AdornmentButton>
        <RiCalendarLine />
      </AdornmentButton>
    </>
  ),
}

const meta: Meta<typeof Input> = {
  title: "smoot-design/Input",
  component: Input,
  argTypes: {
    startAdornment: {
      options: Object.keys(ADORNMENTS),
      mapping: ADORNMENTS,
      control: { type: "select" },
    },
    endAdornment: {
      options: Object.keys(ADORNMENTS),
      mapping: ADORNMENTS,
      control: { type: "select" },
    },
  },
  args: {
    onChange: fn(),
    value: "some value",
    placeholder: "placeholder",
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Sizes: Story = {
  render: (args) => {
    return (
      <Stack direction="row" gap={1}>
        <Input size="small" {...args} />
        <Input size="medium" {...args} />
        <Input size="large" {...args} />
        <Input size="hero" {...args} />
      </Stack>
    )
  },
}

/**
 * **Note:** Adornments should be wrapped in an `AdornmentButton` component.
 *
 * ```tsx
 * <Input startAdornment={
 *  <AdornmentButton>
 *    <RiSearchLine />
 *  </AdornmentButton>
 * } {...otherProps} />
 * ```
 */
export const Adornments: Story = {
  render: (args) => {
    const adornments = [
      { startAdornment: ADORNMENTS.SearchIcon },
      { endAdornment: ADORNMENTS.CloseIcon },
      {
        startAdornment: ADORNMENTS.SearchIcon,
        endAdornment: ADORNMENTS["Close and Calendar"],
      },
    ]
    return (
      <Grid container maxWidth="1400px" spacing={2}>
        {Object.values(adornments).flatMap((props, i) =>
          SIZES.map((size) => {
            return (
              <Grid size={{ xs: 3 }} key={`${i}-${size}`}>
                <Input {...args} size={size} {...props} />
              </Grid>
            )
          }),
        )}
      </Grid>
    )
  },
  argTypes: {
    startAdornment: { table: { disable: true } },
    endAdornment: { table: { disable: true } },
  },
}

const PageStyles = styled.div(`
  input {
    background-color: red;
    border: 2px solid blue;
  }

  input[type="text"] {
    background: red;
  }

  input:disabled {
    background-image: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
  }

  .MuiInputBase-input {
    background: red;
  }
`)

/**
 * Tests that the Input component maintains its intended styling across all states
 * even when parent page styles attempt to override it. The PageStyles wrapper
 * includes potentially conflicting CSS that might exist in a consuming application.
 */
export const StatesAndParentStyleResistance: Story = {
  render: (args) => {
    return (
      <PageStyles>
        <Grid container spacing={2} alignItems="center" maxWidth="400px">
          <Grid size={{ xs: 4 }}>
            <Typography>Placeholder</Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Input {...args} value="" />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography>Default</Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Input {...args} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography>Initially Focused</Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Input
              // This is a story just demonstrating the autofocus prop
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              {...args}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography>Error</Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Input {...args} error />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography>Disabled</Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Input {...args} disabled />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography>Password</Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Input {...args} type="password" />
          </Grid>
        </Grid>
      </PageStyles>
    )
  },
  args: {
    placeholder: "This is placeholder text.",
    value: "Some value",
  },
  argTypes: {
    placeholder: { table: { disable: true } },
    value: { table: { disable: true } },
    error: { table: { disable: true } },
    disabled: { table: { disable: true } },
  },
}
