import "@testing-library/jest-dom"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const failOnConsole = require("jest-fail-on-console")

failOnConsole()

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
