import { act, render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import * as React from "react"
import { FeedbackDrawerManager } from "./FeedbackDrawerManager"
import { RATE_LIMIT_MESSAGE } from "./FeedbackDrawer"
import { ThemeProvider } from "../../components/ThemeProvider/ThemeProvider"

const ORIGIN = "http://localhost:6006"
const SUBMIT_URL = "http://localhost:4567/feedback"

const PAYLOAD = {
  courseId: "course-v1:MITx+6.00+2024",
  blockUsageKey: "block-v1:MITx+6.00+2024+type@video+block@abc",
  blockType: "video",
  blockDisplayName: "Lecture 1",
}

const openMessage = () =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: ORIGIN,
        data: { type: "ol-feedback::drawer-open", payload: PAYLOAD },
      }),
    )
  })

describe("FeedbackDrawerManager", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    // jsdom persists document.cookie across tests; clear any set during a test
    // so cookie state can't leak into later tests.
    document.cookie.split(";").forEach((entry) => {
      const name = entry.split("=")[0].trim()
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    })
  })

  test("renders a waiting marker until an open message arrives", () => {
    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    screen.getByTestId("feedback-drawer-manager-waiting")
    expect(screen.queryByText("How was this content?")).toBeNull()
  })

  test("ignores messages from a different origin", () => {
    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "http://evil.example",
          data: { type: "ol-feedback::drawer-open", payload: PAYLOAD },
        }),
      )
    })
    expect(screen.queryByText("How was this content?")).toBeNull()
  })

  test("passes a keyboard-open through to the drawer's focus-ring marker", () => {
    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: ORIGIN,
          data: {
            type: "ol-feedback::drawer-open",
            payload: PAYLOAD,
            viaKeyboard: true,
          },
        }),
      )
    })
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "data-focus-ring",
    )
  })

  test("omits the focus-ring marker for a mouse open (no keyboard flag)", () => {
    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    openMessage()
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveAttribute(
      "data-focus-ring",
    )
  })

  test("opens the drawer and POSTs the mapped body on submit", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: true } as Response)
    document.cookie = "csrftoken-test=tok123"
    render(
      <FeedbackDrawerManager
        messageOrigin={ORIGIN}
        variant="slot"
        submitUrl={SUBMIT_URL}
        csrfCookieName="csrftoken-test"
        csrfHeaderName="X-CSRFToken"
        getEnrichment={() => ({
          courseName: "Intro to CS",
          unitTitle: "Unit 3",
          url: "http://localhost:6006/learning/x",
        })}
      />,
      { wrapper: ThemeProvider },
    )
    openMessage()
    screen.getByText("How was this content?")
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.type(
      screen.getByRole("textbox", { name: "What did you like?" }),
      "clear",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl, opts] = fetchMock.mock.calls[0]
    const init = opts as RequestInit
    const headers = init.headers as Record<string, string>
    expect(calledUrl).toBe(SUBMIT_URL)
    expect(init.method).toBe("POST")
    expect(init.credentials).toBe("include")
    expect(headers["Content-Type"]).toBe("application/json")
    expect(headers["X-CSRFToken"]).toBe("tok123")
    expect(JSON.parse(init.body as string)).toEqual({
      course_id: PAYLOAD.courseId,
      course_name: "Intro to CS",
      block_usage_key: PAYLOAD.blockUsageKey,
      block_type: PAYLOAD.blockType,
      block_display_name: PAYLOAD.blockDisplayName,
      unit_title: "Unit 3",
      url: "http://localhost:6006/learning/x",
      sentiment: "positive",
      comment: "clear",
    })
    await screen.findByText("Thank you for your feedback!")
  })

  test("shows the block display name as the drawer subtitle", () => {
    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    openMessage()
    expect(screen.getByText(PAYLOAD.blockDisplayName)).toBeVisible()
  })

  test("clears the drawer on a close message", () => {
    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    openMessage()
    screen.getByText("How was this content?")
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: ORIGIN,
          data: { type: "ol-feedback::drawer-close" },
        }),
      )
    })
    expect(screen.queryByText("How was this content?")).toBeNull()
    screen.getByTestId("feedback-drawer-manager-waiting")
  })

  test("posts a drawer-closed message back to the opener when closed", async () => {
    // The megaphone trigger lives in a cross-origin LMS iframe, so the manager
    // (running in the MFE parent) can't focus it directly. On close it must
    // signal the opener window (event.source) so the trigger can refocus itself.
    const iframe = document.createElement("iframe")
    document.body.appendChild(iframe)
    const opener = iframe.contentWindow as Window
    const postSpy = jest
      .spyOn(opener, "postMessage")
      .mockImplementation(() => {})

    render(<FeedbackDrawerManager messageOrigin={ORIGIN} variant="slot" />, {
      wrapper: ThemeProvider,
    })
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: ORIGIN,
          source: opener,
          data: { type: "ol-feedback::drawer-open", payload: PAYLOAD },
        }),
      )
    })
    screen.getByText("How was this content?")

    await user.click(screen.getByRole("button", { name: "Close" }))

    expect(postSpy).toHaveBeenCalledWith(
      { type: "ol-feedback::drawer-closed" },
      ORIGIN,
    )
    iframe.remove()
  })

  test("primes the CSRF cookie when missing, then POSTs with the token", async () => {
    const PRIME_URL = "http://localhost:4567/users/me"
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === PRIME_URL) {
        document.cookie = "csrftoken-prime=primedtok"
        return Promise.resolve({ ok: true } as Response)
      }
      return Promise.resolve({ ok: true } as Response)
    })
    render(
      <FeedbackDrawerManager
        messageOrigin={ORIGIN}
        variant="slot"
        submitUrl={SUBMIT_URL}
        csrfCookieName="csrftoken-prime"
        csrfHeaderName="X-CSRFToken"
        csrfPrimeUrl={PRIME_URL}
      />,
      { wrapper: ThemeProvider },
    )
    openMessage()
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.type(
      screen.getByRole("textbox", { name: "What did you like?" }),
      "clear",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(fetchMock.mock.calls[0][0]).toBe(PRIME_URL)
    expect((fetchMock.mock.calls[0][1] as RequestInit).credentials).toBe(
      "include",
    )
    const [postUrl, postInit] = fetchMock.mock.calls[1]
    expect(postUrl).toBe(SUBMIT_URL)
    expect(
      (postInit as RequestInit).headers as Record<string, string>,
    ).toMatchObject({ "X-CSRFToken": "primedtok" })
  })

  test("does not prime when the CSRF cookie is already present", async () => {
    const PRIME_URL = "http://localhost:4567/users/me"
    document.cookie = "csrftoken-present=already"
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: true } as Response)
    render(
      <FeedbackDrawerManager
        messageOrigin={ORIGIN}
        variant="slot"
        submitUrl={SUBMIT_URL}
        csrfCookieName="csrftoken-present"
        csrfHeaderName="X-CSRFToken"
        csrfPrimeUrl={PRIME_URL}
      />,
      { wrapper: ThemeProvider },
    )
    openMessage()
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.type(
      screen.getByRole("textbox", { name: "What did you like?" }),
      "clear",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(SUBMIT_URL)
  })

  test("still submits if priming fails (best-effort)", async () => {
    const PRIME_URL = "http://localhost:4567/users/me"
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === PRIME_URL) {
        return Promise.reject(new Error("network"))
      }
      return Promise.resolve({ ok: true } as Response)
    })
    render(
      <FeedbackDrawerManager
        messageOrigin={ORIGIN}
        variant="slot"
        submitUrl={SUBMIT_URL}
        csrfCookieName="csrftoken-fail"
        csrfHeaderName="X-CSRFToken"
        csrfPrimeUrl={PRIME_URL}
      />,
      { wrapper: ThemeProvider },
    )
    openMessage()
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.type(
      screen.getByRole("textbox", { name: "What did you like?" }),
      "clear",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    const postCall = fetchMock.mock.calls.find((c) => c[0] === SUBMIT_URL)
    expect(postCall).toBeTruthy()
    await screen.findByText("Thank you for your feedback!")
  })

  test("shows the rate-limit message on a 429 response", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false, status: 429 } as Response)
    render(
      <FeedbackDrawerManager
        messageOrigin={ORIGIN}
        variant="slot"
        submitUrl={SUBMIT_URL}
      />,
      { wrapper: ThemeProvider },
    )
    openMessage()
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))
    await screen.findByText(RATE_LIMIT_MESSAGE)
  })

  test("submits without a CSRF header when priming does not set the cookie", async () => {
    const PRIME_URL = "http://localhost:4567/users/me"
    // Prime resolves OK but never sets the cookie (e.g. non-OK upstream or a
    // response that doesn't carry Set-Cookie): the POST must still go out,
    // just without the token header.
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: true } as Response)
    render(
      <FeedbackDrawerManager
        messageOrigin={ORIGIN}
        variant="slot"
        submitUrl={SUBMIT_URL}
        csrfCookieName="csrftoken-empty"
        csrfHeaderName="X-CSRFToken"
        csrfPrimeUrl={PRIME_URL}
      />,
      { wrapper: ThemeProvider },
    )
    openMessage()
    await user.click(screen.getByRole("radio", { name: "Liked it" }))
    await user.type(
      screen.getByRole("textbox", { name: "What did you like?" }),
      "clear",
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(fetchMock.mock.calls[0][0]).toBe(PRIME_URL)
    const postCall = fetchMock.mock.calls.find((c) => c[0] === SUBMIT_URL)
    expect(postCall).toBeTruthy()
    const headers = (postCall![1] as RequestInit).headers as Record<
      string,
      string
    >
    expect(headers["X-CSRFToken"]).toBeUndefined()
    await screen.findByText("Thank you for your feedback!")
  })
})
