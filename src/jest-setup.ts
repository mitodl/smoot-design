import "@testing-library/jest-dom"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const failOnConsole = require("jest-fail-on-console")

failOnConsole({
  // Ignore React 18 "not wrapped in act(...)" warnings from async updates in
  // MUI, react-transition-group, ScrollSnap, AiChat, etc.
  silenceMessage: (message: string) =>
    typeof message === "string" &&
    message.includes("inside a test was not wrapped in act(...)"),
})

beforeAll(() => {
  const scrollBy = jest.fn()
  HTMLElement.prototype.scrollBy = scrollBy
})

afterEach(() => {
  /**
   * Clear all mock call counts between tests.
   * This does NOT clear mock implementations.
   * Mock implementations are always cleared between test files.
   */
  jest.clearAllMocks()
})
