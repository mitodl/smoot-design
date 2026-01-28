import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  CheckboxChoiceField,
  CheckboxChoiceFieldProps,
} from "./CheckboxChoiceField"
import { ThemeProvider } from "../ThemeProvider/ThemeProvider"

describe("CheckboxChoiceField (Controlled)", () => {
  // Test scenarios where a `values` prop is provided.

  it("should call onChange with correct arguments when a checkbox is clicked", async () => {
    const handleChange = jest.fn()
    const choices: CheckboxChoiceFieldProps["choices"] = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ]

    render(
      <CheckboxChoiceField
        name="test-group"
        choices={choices}
        values={["2"]}
        onChange={handleChange}
      />,
      { wrapper: ThemeProvider },
    )

    const checkbox3 = screen.getByRole("checkbox", { name: "Option 3" })
    await userEvent.click(checkbox3)

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: checkbox3 }),
      ["2", "3"], // values
    )
  })
})

describe("CheckboxChoiceField (Uncontrolled)", () => {
  // Test scenarios where a `values` prop is not provided.
  it("should call onChange with correct arguments when a checkbox is clicked", async () => {
    const handleChange = jest.fn()
    const choices: CheckboxChoiceFieldProps["choices"] = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ]

    render(
      <CheckboxChoiceField
        name="test-group"
        choices={choices}
        onChange={handleChange}
      />,
      { wrapper: ThemeProvider },
    )

    const checkbox2 = screen.getByRole("checkbox", { name: "Option 2" })

    await userEvent.click(checkbox2)

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: checkbox2 }),
      ["2"], // values
    )

    const checkbox3 = screen.getByRole("checkbox", { name: "Option 3" })
    await userEvent.click(checkbox3)

    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: checkbox3 }),
      ["2", "3"], // values
    )
  })
})
