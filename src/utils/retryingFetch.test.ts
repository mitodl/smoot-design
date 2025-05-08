import retryingFetch from "./retryingFetch"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const counter = jest.fn() // use jest.fn as counter because it resets on each test
const NETWORK_SUCCESS_URL = "http://localhost:3456/success"
const NETWORK_ERROR_URL = "http://localhost:3456/error"
const server = setupServer(
  http.get(NETWORK_SUCCESS_URL, async ({ request }) => {
    counter()
    const url = new URL(request.url)
    const status = +(url.searchParams.get("status") ?? 200)
    return HttpResponse.text(`Status ${status}`, { status })
  }),
  http.get(NETWORK_ERROR_URL, async () => {
    counter()
    return HttpResponse.error()
  }),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("retryingFetch", () => {
  beforeAll(() => {})

  test.each([200, 201, 202, 367, 400, 401, 403])(
    "should not retry on %s",
    async (status) => {
      const result = await retryingFetch(
        `${NETWORK_SUCCESS_URL}?status=${status}`,
      )
      expect(await result.text()).toBe(`Status ${status}`)
      expect(counter).toHaveBeenCalledTimes(1)
    },
  )

  test.each([429, 500, 501, 502, 503])("should retry on %s", async (status) => {
    const result = await retryingFetch(
      `${NETWORK_SUCCESS_URL}?status=${status}`,
    )
    expect(await result.text()).toBe(`Status ${status}`)
    expect(counter).toHaveBeenCalledTimes(4)
  })

  test("should retry on error", async () => {
    const result = await retryingFetch(NETWORK_ERROR_URL).catch((err) => err)
    expect(result).toBeInstanceOf(Error)
    expect(counter).toHaveBeenCalledTimes(4)
  })
})
