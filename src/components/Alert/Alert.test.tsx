import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import { ThemeProvider } from "../ThemeProvider/ThemeProvider"
import { Alert } from "./Alert"

const renderAlert = (props: React.ComponentProps<typeof Alert>) =>
  render(<Alert {...props} />, { wrapper: ThemeProvider })

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

test("Stays visible without autoHideDuration", () => {
  renderAlert({ children: "Message" })
  act(() => {
    jest.advanceTimersByTime(100_000)
  })
  expect(screen.getByRole("alert")).toBeInTheDocument()
})

test("Hides itself after autoHideDuration elapses", () => {
  renderAlert({ children: "Message", autoHideDuration: 3000 })
  expect(screen.getByRole("alert")).toBeInTheDocument()
  act(() => {
    jest.advanceTimersByTime(2999)
  })
  expect(screen.getByRole("alert")).toBeInTheDocument()
  act(() => {
    jest.advanceTimersByTime(1)
  })
  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
})

test("Calls onClose when autoHideDuration elapses", () => {
  const onClose = jest.fn()
  renderAlert({ children: "Message", autoHideDuration: 3000, onClose })
  act(() => {
    jest.advanceTimersByTime(3000)
  })
  expect(onClose).toHaveBeenCalledTimes(1)
})
