import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import {
  CheckboxChoiceField,
  CheckboxChoiceFieldProps,
} from "./CheckboxChoiceField"
import Typography from "@mui/material/Typography"
import { fn } from "storybook/test"

const CHOICES: CheckboxChoiceFieldProps["choices"] = [
  { label: "Choice 1", value: "1" },
  { label: "Choice 2", value: "2" },
  { label: "Choice 3", value: "3", disabled: true },
  { label: "Choice 4", value: "4" },
]

const StateWrapper = (props: CheckboxChoiceFieldProps) => {
  const [values, setValues] = React.useState(props.value ?? [])

  const handleChange: CheckboxChoiceFieldProps["onChange"] = (
    event,
    values,
  ) => {
    fn()(event, values)
    setValues(values)
  }
  return (
    <>
      <CheckboxChoiceField {...props} values={values} onChange={handleChange} />
      <br />
      <br />
      <Typography variant="body1">Selected: {values?.join(", ")}</Typography>
    </>
  )
}

const meta: Meta<typeof CheckboxChoiceField> = {
  title: "smoot-design/CheckboxChoiceField",
  component: CheckboxChoiceField,
  render: (args) => <StateWrapper {...args} />,
  args: {
    choices: CHOICES,
    name: "checkbox-group",
  },
}

export default meta

type Story = StoryObj<typeof CheckboxChoiceField>

export const WithoutLabel: Story = {}

export const WithLabel: Story = {
  args: {
    label: "CheckboxChoiceField",
  },
}

export const Disabled: Story = {
  args: {
    label: "CheckboxChoiceField disabled",
    disabled: true,
  },
}
