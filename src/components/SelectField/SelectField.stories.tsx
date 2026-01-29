import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { SelectField } from "./SelectField"
import type { SelectFieldProps } from "./SelectField"
import { MenuItem } from "../MenuItem/MenuItem"

import Stack from "@mui/material/Stack"
import Grid from "@mui/material/Grid"
import { fn } from "@storybook/test"

const SIZES = ["small", "medium", "large"] satisfies SelectFieldProps["size"][]
const meta: Meta<typeof SelectField> = {
  title: "smoot-design/Dropdowns/SelectField (low-level)",
  argTypes: {
    size: {
      options: SIZES,
      control: {
        type: "select",
      },
    },
    onChange: { table: { disable: true } },
  },
  args: {
    onChange: fn(),
    label: "Label",
    helpText: "Help text the quick brown fox jumps over the lazy dog",
    errorText: "Error text the quick brown fox jumps over the lazy dog",
    name: "select-example",
  },
}

export default meta

const ITEMS = [
  { label: "Please select one...", props: { value: "", disabled: true } },
  { label: "Option 1", props: { value: "value1" } },
  { label: "Option 2", props: { value: "value2" } },
  { label: "Option 3", props: { value: "value3" } },
]

type Story = StoryObj<typeof SelectField>

const RenderSizes = (args: Story["args"]) => {
  const [value, setValue] = React.useState("")
  const onChange: SelectFieldProps["onChange"] = (event, node) => {
    setValue(event.target.value as string)
    args?.onChange?.(event, node)
  }
  const props = { ...args, value, onChange } as SelectFieldProps
  return (
    <Stack direction="column" gap={2}>
      {SIZES.map((size) => (
        <SelectField key={size} {...props} size={size}>
          {ITEMS.map((item) => (
            <MenuItem key={item.props.value} {...item.props} size={size}>
              {item.label}
            </MenuItem>
          ))}
        </SelectField>
      ))}
    </Stack>
  )
}

export const Sizes: Story = {
  render: (args) => <RenderSizes {...args} />,
}

const STATES = [
  { label: "Placeholder", extraProps: { value: "" } },
  { label: "Default", extraProps: {} },
  { label: "Required", extraProps: { required: true } },
  { label: "Error", extraProps: { error: true } },
  { label: "Disabled", extraProps: { disabled: true } },
]
const RenderStates = (args: Story["args"]) => {
  const [value, setValue] = React.useState("")
  const onChange: SelectFieldProps["onChange"] = (event, node) => {
    setValue(event.target.value as string)
    args?.onChange?.(event, node)
  }
  const props = {
    ...args,
    value,
    onChange,
  } as SelectFieldProps
  return (
    <Grid container spacing={2} alignItems="top" maxWidth="400px">
      {STATES.map(({ label, extraProps }) => (
        <React.Fragment key={label}>
          <Grid size={{ xs: 4 }}>{label}</Grid>
          <Grid size={{ xs: 8 }}>
            <SelectField {...props} {...extraProps}>
              {ITEMS.map((item) => (
                <MenuItem
                  key={item.props.value}
                  {...item.props}
                  size={args?.size}
                >
                  {item.label}
                </MenuItem>
              ))}
            </SelectField>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  )
}

export const States: Story = {
  render: (args) => <RenderStates {...args} />,
  argTypes: {
    value: { table: { disable: true } },
    error: { table: { disable: true } },
    disabled: { table: { disable: true } },
  },
}
