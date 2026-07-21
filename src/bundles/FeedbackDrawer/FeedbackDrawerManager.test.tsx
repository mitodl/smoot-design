import { act, render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import * as React from "react"
import { FeedbackDrawerManager } from "./FeedbackDrawerManager"
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
})
