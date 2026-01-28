import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { Input, AdornmentButton } from "./Input"
import type { InputProps } from "./Input"
import Stack from "@mui/material/Stack"
import Grid from "@mui/material/Grid"
import { RiCalendarLine, RiCloseLine, RiSearchLine } from "@remixicon/react"
import { fn } from "storybook/test"
import { enumValues } from "../../story-utils"

const StatefulInput = (props: InputProps) => {
  const [value, setValue] = React.useState(props.value || "")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    props.onChange?.(event)
  }

  return <Input {...props} value={value} onChange={handleChange} />
}

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
        <StatefulInput size="small" {...args} />
        <StatefulInput size="medium" {...args} />
        <StatefulInput size="large" {...args} />
        <StatefulInput size="hero" {...args} />
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
                <StatefulInput {...args} size={size} {...props} />
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

export const Multiline: Story = {
  render: (args) => {
    return (
      <Stack direction="column" gap={1}>
        <StatefulInput
          size="small"
          {...args}
          multiline
          endAdornment={ADORNMENTS.SearchIcon}
        />
        <StatefulInput
          size="medium"
          {...args}
          multiline
          endAdornment={ADORNMENTS.SearchIcon}
        />
        <StatefulInput
          size="large"
          {...args}
          multiline
          endAdornment={ADORNMENTS.SearchIcon}
        />
        <StatefulInput
          size="hero"
          {...args}
          multiline
          endAdornment={ADORNMENTS.SearchIcon}
        />
        <StatefulInput
          size="chat"
          {...args}
          value={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
          multiline
          endAdornment={ADORNMENTS.SearchIcon}
        />
      </Stack>
    )
  },
}
