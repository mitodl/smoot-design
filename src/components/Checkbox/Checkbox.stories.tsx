import React, { useState, ChangeEvent } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { Checkbox } from "./Checkbox"
import type { CheckboxProps } from "./Checkbox"

const StateWrapper = (props: CheckboxProps) => {
  const [checked, setChecked] = useState(!!props.checked)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    props.onChange?.(event)
  }

  return <Checkbox {...props} checked={checked} onChange={handleChange} />
}

const meta: Meta<typeof Checkbox> = {
  title: "smoot-design/Checkbox",
  component: Checkbox,
  render: (args) => <StateWrapper {...args} />,
}

export default meta

type Story = StoryObj<typeof Checkbox>

export const Simple: Story = {}

export const WithLabel: Story = {
  args: {
    label: "Checkbox",
  },
}

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
  },
}
