import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { TextField } from "./TextField"
import type { TextFieldProps } from "./TextField"
import { AdornmentButton } from "../Input/Input"
import Stack from "@mui/material/Stack"
import Grid from "@mui/material/Grid"
import { RiSearchLine, RiCalendarLine, RiCloseLine } from "@remixicon/react"
import { fn } from "storybook/test"
import { enumValues } from "../../story-utils"

const SIZES = enumValues<NonNullable<TextFieldProps["size"]>>({
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

const meta: Meta<typeof TextField> = {
  title: "smoot-design/TextField",
  component: TextField,
  argTypes: {
    size: {
      options: SIZES,
      control: { type: "select" },
    },
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
    multiline: false,
    disabled: false,
    value: "some value",
    placeholder: "placeholder",
    label: "Label",
    helpText: "Help text the quick brown fox jumps over the lazy dog",
    errorText: "Error text the quick brown fox jumps over the lazy dog",
  },
}
export default meta

type Story = StoryObj<typeof TextField>

export const Simple: Story = {
  render: (args) => {
    return <TextField {...args} />
  },
}

export const Sizes: Story = {
  render: (args) => {
    return (
      <Stack direction="row" gap={1}>
        <TextField {...args} size="small" />
        <TextField {...args} size="medium" />
        <TextField {...args} size="large" />
        <TextField {...args} size="hero" />
      </Stack>
    )
  },
  argTypes: { size: { table: { disable: true } } },
}

export const Widths: Story = {
  render: (args) => {
    return (
      <Stack direction="column" gap={1}>
        <TextField {...args} label="default" />
        <TextField {...args} label="fullWidth" fullWidth />
      </Stack>
    )
  },
  argTypes: { fullWidth: { table: { disable: true } } },
}

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
      <Grid container maxWidth="600px" spacing={2}>
        {Object.values(adornments).flatMap((props, i) =>
          SIZES.map((size) => {
            return (
              <Grid item xs={6} key={`${i}-${size}`}>
                <TextField {...args} size={size} {...props} />
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

export const States: Story = {
  render: (args) => {
    return (
      <Grid container spacing={2} alignItems="top" maxWidth="400px">
        <Grid item xs={4}>
          Placeholder
        </Grid>
        <Grid item xs={8}>
          <TextField {...args} value="" />
        </Grid>
        <Grid item xs={4}>
          Default
        </Grid>
        <Grid item xs={8}>
          <TextField {...args} />
        </Grid>
        <Grid item xs={4}>
          Required
        </Grid>
        <Grid item xs={8}>
          <TextField required {...args} />
        </Grid>
        <Grid item xs={4}>
          Error
        </Grid>
        <Grid item xs={8}>
          <TextField {...args} error />
        </Grid>
        <Grid item xs={4}>
          Disabled
        </Grid>
        <Grid item xs={8}>
          <TextField {...args} disabled />
        </Grid>
      </Grid>
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
