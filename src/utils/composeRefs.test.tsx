import * as React from "react"
import { composeRefs } from "./composeRefs"
import { render, screen } from "@testing-library/react"

describe("composeRefs", () => {
  test("Composing object + fn ref", () => {
    const objRef1 = React.createRef<HTMLDivElement>()
    const objRef2 = React.createRef<HTMLDivElement>()
    const fnRef1 = jest.fn()
    const fnRef2 = jest.fn()

    render(
      <div
        data-testid="my-div"
        ref={composeRefs(objRef1, objRef2, fnRef1, fnRef2)}
      />,
    )

    const el = screen.getByTestId("my-div")
    expect(objRef1.current).toBe(el)
    expect(objRef2.current).toBe(el)
    expect(fnRef1).toHaveBeenCalledWith(el)
    expect(fnRef2).toHaveBeenCalledWith(el)
  })
})
