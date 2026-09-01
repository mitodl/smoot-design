import * as React from "react"
import { screen, render } from "@testing-library/react"
import user from "@testing-library/user-event"
import { BooleanRadioChoiceField, RadioChoiceField } from "./RadioChoiceField"
import { ThemeProvider } from "../ThemeProvider/ThemeProvider"

describe("RadioChoiceField", () => {
  const setup = (props?: { required?: boolean }) =>
    render(
      <RadioChoiceField
        label="Favourite colour"
        name="colour"
        choices={[
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ]}
        {...props}
      />,
      { wrapper: ThemeProvider },
    )

  it("marks the group required, since no single radio carries it", () => {
    setup({ required: true })

    const group = screen.getByRole("radiogroup", { name: /Favourite colour/ })
    expect(group).toHaveAttribute("aria-required", "true")
  })

  it("is not required by default", () => {
    setup()

    expect(
      screen.getByRole("radiogroup", { name: "Favourite colour" }),
    ).not.toHaveAttribute("aria-required")
  })

  it("hides the asterisk from assistive tech, which reads the label instead", () => {
    setup({ required: true })

    // The accessible name is the label alone: no "star", and no "*".
    screen.getByRole("radiogroup", { name: "Favourite colour" })
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("BooleanRadioChoiceField", () => {
  it.each([
    {
      value: true,
      expectedChecks: { yes: true, no: false },
    },
    {
      value: false,
      expectedChecks: { yes: false, no: true },
    },
    {
      value: undefined,
      expectedChecks: { yes: false, no: false },
    },
  ])("renders correctly", ({ value, expectedChecks }) => {
    const onChange = jest.fn()
    render(
      <BooleanRadioChoiceField
        value={value}
        label="Test"
        name="test"
        choices={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
        onChange={onChange}
      />,
      { wrapper: ThemeProvider },
    )
    const yes = screen.getByLabelText<HTMLInputElement>("Yes")
    const no = screen.getByLabelText<HTMLInputElement>("No")
    expect(yes.checked).toBe(expectedChecks.yes)
    expect(no.checked).toBe(expectedChecks.no)
  })

  it("calls onChange when clicking and converts value to boolean", async () => {
    const onChange = jest.fn()
    render(
      <BooleanRadioChoiceField
        label="Test"
        name="test"
        choices={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
        onChange={onChange}
      />,
      { wrapper: ThemeProvider },
    )
    await user.click(screen.getByLabelText("Yes"))
    expect(onChange).toHaveBeenCalledWith({ name: "test", value: true })
    await user.click(screen.getByLabelText("No"))
    expect(onChange).toHaveBeenCalledWith({ name: "test", value: false })
  })
})
