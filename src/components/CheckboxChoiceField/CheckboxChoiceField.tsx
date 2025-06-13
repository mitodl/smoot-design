import * as React from "react"
import { Checkbox, CheckboxProps } from "../Checkbox/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import styled from "@emotion/styled"

type CheckboxChoice = Omit<CheckboxProps, "name" | "onChange" | "checked"> & {
  value: string
}
export type CheckboxChoiceFieldProps = {
  label?: React.ReactNode
  value?: string[]
  name: string
  choices: CheckboxChoice[]
  values?: string[]
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    values: string[],
  ) => void
  className?: string
  vertical?: boolean
  disabled?: boolean
}

const Container = styled.div(({ theme }) => ({
  display: "flex",
  gap: "32px",
  flexDirection: "row",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}))

const VerticalContainer = styled(Container)({
  gap: "18px",
  flexDirection: "column",
})

const Label = styled(FormLabel)(({ theme }) => ({
  marginTop: "0",
  marginBottom: "16px",
  width: "100%",
  color: theme.custom.colors.darkGray2,
  ...theme.typography.subtitle2,
})) as typeof FormLabel // https://mui.com/material-ui/guides/typescript/?srsltid=AfmBOoo9kvRiALbxt4kAarRGiKaiJ7tbui5tstoL23DYscJPyk6UaTul#complications-with-the-component-prop

/**
 * Checkboxes grouped together as a fieldset with a label.
 */
const CheckboxChoiceField: React.FC<CheckboxChoiceFieldProps> = ({
  label,
  name,
  choices,
  values,
  onChange,
  className,
  vertical = false,
  disabled = false,
}) => {
  const isChecked = (value: string) => {
    if (values === undefined) return undefined
    return values.includes(value)
  }
  const _Container = vertical ? VerticalContainer : Container
  const handleChange: CheckboxProps["onChange"] = (event) => {
    const fieldset = event.target.closest("fieldset")
    const checked =
      fieldset?.querySelectorAll<HTMLInputElement>(
        "input[type='checkbox']:checked",
      ) || []
    onChange?.(
      event,
      Array.from(checked).map((input) => input.value),
    )
  }

  return (
    <FormControl
      component="fieldset"
      sx={{ width: "100%" }}
      className={className}
      disabled={disabled}
    >
      {label && <Label component="legend">{label}</Label>}
      <_Container>
        {choices.map((choice) => {
          return (
            <Checkbox
              key={choice.value}
              name={name}
              checked={isChecked(choice.value)}
              onChange={handleChange}
              disabled={disabled}
              {...choice}
            />
          )
        })}
      </_Container>
    </FormControl>
  )
}

export { CheckboxChoiceField }
