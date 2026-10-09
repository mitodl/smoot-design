import * as React from "react"
import { act, within } from "@testing-library/react"
import { init } from "./contactUsLauncher"

jest.mock("../components/AiChat/Markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}))

jest.mock("better-react-mathjax", () => ({
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.ResizeObserver = MockResizeObserver

const SETTINGS = { chat: { apiUrl: "http://localhost:4567/support" } }

const hostContainer = () => {
  const container = document.createElement("div")
  container.innerHTML = '<p data-testid="host-markup">host owned</p>'
  document.body.appendChild(container)
  return container
}

const mount = (container?: HTMLElement) => {
  let result!: ReturnType<typeof init>
  act(() => {
    result = init({ settings: SETTINGS }, container ? { container } : undefined)
  })
  return result
}

const hostMarkup = (container: HTMLElement) =>
  container.querySelector('[data-testid="host-markup"]')

afterEach(() => {
  document.body.innerHTML = ""
})

test("mounting into a host container leaves the host's own markup in place", () => {
  // React clears the container it is given on first commit, so the launcher has
  // to render into a child of it, not into the host's element itself.
  const container = hostContainer()

  const { unmount } = mount(container)

  expect(hostMarkup(container)).not.toBeNull()
  act(() => unmount())
})

test("unmounting from a host container removes only what init added", () => {
  const container = hostContainer()
  const { unmount } = mount(container)

  act(() => unmount())

  expect(container.isConnected).toBe(true)
  expect(hostMarkup(container)).not.toBeNull()
  expect(container.childElementCount).toBe(1)
})

test("unmounting removes a container init created for itself", () => {
  const { container, unmount } = mount()

  act(() => unmount())

  expect(container.isConnected).toBe(false)
})

test("leaves a host container's id alone", () => {
  // Stamping our id on a caller's element hijacks their getElementById, and
  // two launchers in two host divs would end up sharing one id.
  const container = hostContainer()

  const { unmount } = mount(container)

  expect(container.id).toBe("")
  act(() => unmount())
})

test("renders the launcher into the host container", () => {
  // The launcher button is icon-only, named by its aria-label rather than
  // visible text, so the host's markup is checked by accessible name.
  const container = hostContainer()

  const { unmount } = mount(container)

  expect(
    within(container).getByRole("button", { name: "Contact us" }),
  ).toBeInTheDocument()
  act(() => unmount())
})
