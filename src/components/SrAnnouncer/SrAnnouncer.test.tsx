import * as React from "react"
import { render, act } from "@testing-library/react"
import { SrAnnouncer } from "./SrAnnouncer"

const sleep = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms)
  })
}

describe("SrAnnouncer", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllTimers()
  })

  test("Renders a message when not loading", () => {
    const { container } = render(
      <SrAnnouncer message="Hello, world!" isLoading={false} />,
    )
    expect(container.textContent).toBe("Hello, world!")
  })

  test("Renders a loading message when loading", async () => {
    const loadingMessages = [
      { delay: 100, text: "Loading 1" },
      { delay: 200, text: "Loading 2" },
    ]
    const { container, rerender } = render(
      <SrAnnouncer
        message="Hello, world!"
        loadingMessages={loadingMessages}
        isLoading={true}
      />,
    )

    expect(container.textContent).toBe("")

    sleep(100)
    expect(container.textContent).toBe("Loading 1")
    sleep(100)
    expect(container.textContent).toBe("Loading 1")
    sleep(100)
    expect(container.textContent).toBe("Loading 2")
    sleep(1000)
    expect(container.textContent).toBe("Loading 2")

    rerender(
      <SrAnnouncer
        message="Hello, world!"
        loadingMessages={loadingMessages}
        isLoading={false}
      />,
    )
    expect(container.textContent).toBe("Hello, world!")

    rerender(
      <SrAnnouncer
        message="Hello, world!"
        loadingMessages={loadingMessages}
        isLoading={true}
      />,
    )

    expect(container.textContent).toBe("")
    sleep(100)
    expect(container.textContent).toBe("Loading 1")
    sleep(100)
    expect(container.textContent).toBe("Loading 1")
    sleep(100)
    expect(container.textContent).toBe("Loading 2")
  })

  test("Warns if loadingMessages changes unexpectedly", () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {})
    const { rerender } = render(
      <SrAnnouncer message="Hello, world!" isLoading={true} />,
    )

    rerender(
      <SrAnnouncer
        message="Hello, world!"
        isLoading={true}
        loadingMessages={[{ delay: 100, text: "Loading" }]}
      />,
    )

    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
