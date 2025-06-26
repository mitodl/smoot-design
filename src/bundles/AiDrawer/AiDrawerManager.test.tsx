import { act, render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import { AiDrawerManager } from "./AiDrawerManager"
import type { AiDrawerInitMessage } from "./AiDrawerManager"
import { ThemeProvider } from "../../components/ThemeProvider/ThemeProvider"
import * as React from "react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { faker } from "@faker-js/faker/locale/en"
import { TrackingEvent, TrackingEventType } from "./trackingEvents"

jest.mock("../../components/AiChat/Markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <div>{children}</div>,
  }
})

jest.mock("better-react-mathjax", () => ({
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const TEST_API_STREAMING = "http://localhost:4567/test"
const TEST_TRACKING_EVENTS = "http://localhost:4567/tracking-events"
const CONTENT_FILE_URL = "http://localhost:4567/api/v1/contentfiles/1"

const CONTENT_RESPONSE = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      summary: "This is a test summary",
      flashcards: [
        {
          question: "Test question 1?",
          answer: "Test answer 1",
        },
        {
          question: "Test question 2?",
          answer: "Test answer 2",
        },
        {
          question: "Test question 3?",
          answer: "Test answer 3",
        },
      ],
    },
  ],
}

class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.ResizeObserver = MockResizeObserver

const trackingEvent = jest.fn()
const assertTrackingEvent = (...data: TrackingEvent[]) => {
  expect(trackingEvent).toHaveBeenCalledTimes(data.length)
  data.forEach((eventData) => {
    expect(trackingEvent).toHaveBeenCalledWith(eventData)
  })
  trackingEvent.mockClear()
}

describe("AiDrawerManager", () => {
  const server = setupServer(
    http.post(TEST_API_STREAMING, async () => {
      return HttpResponse.text("AI Response")
    }),
    http.get(CONTENT_FILE_URL, () => {
      return HttpResponse.json(CONTENT_RESPONSE)
    }),
    http.post(TEST_TRACKING_EVENTS, async ({ request }) => {
      const body = await request.json()
      trackingEvent(body)
      return HttpResponse.json({ success: true })
    }),
  )

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => server.close())

  const setup = async (message: AiDrawerInitMessage) => {
    server.listen()

    render(<AiDrawerManager messageOrigin="http://localhost:6006" />, {
      wrapper: ThemeProvider,
    })

    await screen.findByTestId("ai-drawer-manager-waiting")

    const event = new MessageEvent("message", {
      data: message,
      origin: "http://localhost:6006",
    })

    await act(async () => {
      window.dispatchEvent(event)
      await new Promise((resolve) => setTimeout(resolve, 100))
    })
  }

  test("Problem drawer opens showing title", async () => {
    await setup({
      type: "smoot-design::ai-drawer-open",
      payload: {
        blockType: "problem",
        blockId: "test-problem-1",
        title: "Drawer Title",
        chat: {
          apiUrl: TEST_API_STREAMING,
        },
      },
    })

    screen.getByRole("heading", { name: "Drawer Title" })
  })

  test("Video drawer opens showing chat entry screen and tabs", async () => {
    await setup({
      type: "smoot-design::ai-drawer-open",
      payload: {
        blockType: "video",
        blockId: "test-video-1",
        chat: {
          entryScreenTitle: "Entry screen title",
          apiUrl: TEST_API_STREAMING,
          conversationStarters: [
            { content: "Prompt 1" },
            { content: "Prompt 2" },
            { content: "Prompt 3" },
          ],
        },
        summary: {
          apiUrl: CONTENT_FILE_URL,
        },
      },
    })

    screen.getByText("Entry screen title")
    screen.getByRole("tab", { name: "Chat" })
    screen.getByRole("tab", { name: "Flashcards" })
    screen.getByRole("tab", { name: "Summary" })

    screen.getByRole("button", { name: "Prompt 1" })
    screen.getByRole("button", { name: "Prompt 2" })
    screen.getByRole("button", { name: "Prompt 3" })
  })

  test("Video drawer chat entry screen selects starters from flashcards", async () => {
    await setup({
      type: "smoot-design::ai-drawer-open",
      payload: {
        blockType: "video",
        blockId: "test-video-2",
        chat: {
          entryScreenTitle: "Entry screen title",
          apiUrl: TEST_API_STREAMING,
        },
        summary: {
          apiUrl: CONTENT_FILE_URL,
        },
      },
    })

    screen.getByRole("button", { name: "Test question 1?" })
    screen.getByRole("button", { name: "Test question 2?" })
    screen.getByRole("button", { name: "Test question 3?" })
  })

  test(
    "Video drawer chat entry screen shows default starters where no flashcards are available",
    server.boundary(async () => {
      const contentResponse = JSON.parse(JSON.stringify(CONTENT_RESPONSE))
      contentResponse.results[0].flashcards = null

      server.use(
        http.get(CONTENT_FILE_URL, () => {
          return HttpResponse.json(contentResponse)
        }),
      )

      await setup({
        type: "smoot-design::ai-drawer-open",
        payload: {
          blockType: "video",
          blockId: "test-video-3",
          chat: {
            entryScreenTitle: "Entry screen title",
            apiUrl: TEST_API_STREAMING,
          },
          summary: {
            apiUrl: CONTENT_FILE_URL,
          },
        },
      })

      screen.getByRole("button", {
        name: "What are the most important concepts introduced in the video?",
      })
      screen.getByRole("button", {
        name: "What examples are used to illustrate concepts covered in the video?",
      })
      screen.getByRole("button", {
        name: "What are the key terms introduced in this video?",
      })
    }),
  )

  test("Video drawer chat entry screen displays default title", async () => {
    await setup({
      type: "smoot-design::ai-drawer-open",
      payload: {
        blockType: "video",
        blockId: "test-video-4",
        chat: {
          apiUrl: TEST_API_STREAMING,
        },
        summary: {
          apiUrl: CONTENT_FILE_URL,
        },
      },
    })

    screen.getByText("What do you want to know about this video?")
  })

  test(
    "Flashcard shows content and can be click navigated",
    server.boundary(async () => {
      await setup({
        type: "smoot-design::ai-drawer-open",
        payload: {
          blockType: "video",
          blockId: "test-video-5",
          chat: {
            apiUrl: TEST_API_STREAMING,
          },
          summary: {
            apiUrl: CONTENT_FILE_URL,
          },
        },
      })

      await user.click(screen.getByRole("tab", { name: "Flashcards" }))

      await user.click(screen.getByText("Q: Test question 1?"))

      screen.getByText("Answer: Test answer 1")

      await user.click(screen.getByRole("button", { name: "Next card" }))

      await user.click(screen.getByText("Q: Test question 2?"))

      screen.getByText("Answer: Test answer 2")

      await user.click(screen.getByRole("button", { name: "Previous card" }))

      screen.getByText("Q: Test question 1?")
    }),
  )

  test(
    "Flashcard shows content and can be keyboard navigated and cycles",
    server.boundary(async () => {
      await setup({
        type: "smoot-design::ai-drawer-open",
        payload: {
          blockType: "video",
          blockId: "test-video-6",
          chat: {
            apiUrl: TEST_API_STREAMING,
          },
          summary: {
            apiUrl: CONTENT_FILE_URL,
          },
        },
      })

      await user.click(screen.getByRole("tab", { name: "Flashcards" }))

      screen.getByText("Q: Test question 1?")

      await user.keyboard("{enter}")

      screen.getByText("Answer: Test answer 1")

      await user.keyboard("{arrowright}")

      screen.getByText("Q: Test question 2?")

      await user.keyboard("{enter}")

      screen.getByText("Answer: Test answer 2")

      await user.keyboard("{arrowleft}")

      screen.getByText("Q: Test question 1?")

      await user.keyboard("{arrowleft}")

      screen.getByText("Q: Test question 3?")

      await user.keyboard("{arrowright}")
      await user.keyboard("{arrowright}")
      await user.keyboard("{arrowright}")

      screen.getByText("Q: Test question 3?")
    }),
  )

  test("Sending Tracking Events [Video]", async () => {
    const blockId = faker.string.uuid()
    await setup({
      type: "smoot-design::ai-drawer-open",
      payload: {
        blockType: "video",
        blockId: blockId,
        trackingUrl: TEST_TRACKING_EVENTS,
        chat: {
          entryScreenTitle: "Entry screen title",
          apiUrl: TEST_API_STREAMING,
          conversationStarters: [
            { content: "Prompt 1" },
            { content: "Prompt 2" },
            { content: "Prompt 3" },
          ],
        },
        summary: {
          apiUrl: CONTENT_FILE_URL,
        },
      },
    })

    assertTrackingEvent({ type: TrackingEventType.Open, blockId })

    await user.click(screen.getByRole("tab", { name: "Flashcards" }))
    assertTrackingEvent({
      type: TrackingEventType.TabChange,
      blockId,
      value: "flashcards",
    })

    await user.click(screen.getByRole("tab", { name: "Chat" }))
    assertTrackingEvent({
      type: TrackingEventType.TabChange,
      blockId,
      value: "chat",
    })

    await user.click(screen.getByRole("button", { name: "Prompt 1" }))
    assertTrackingEvent(
      {
        type: TrackingEventType.Submit,
        blockId,
        value: "Prompt 1",
        source: "conversation-starter",
      },
      {
        type: TrackingEventType.Response,
        blockId,
        value: "AI Response",
      },
    )

    await user.keyboard("{Escape}")
    assertTrackingEvent({
      type: TrackingEventType.Close,
      blockId,
    })
  })

  test("Sending Tracking Events [Problem]", async () => {
    const blockId = faker.string.uuid()
    await setup({
      type: "smoot-design::ai-drawer-open",
      payload: {
        blockType: "problem",
        blockId: blockId,
        trackingUrl: TEST_TRACKING_EVENTS,
        chat: {
          entryScreenTitle: "Entry screen title",
          apiUrl: TEST_API_STREAMING,
          conversationStarters: [
            { content: "Prompt 1" },
            { content: "Prompt 2" },
            { content: "Prompt 3" },
          ],
        },
      },
    })

    assertTrackingEvent({ type: TrackingEventType.Open, blockId })

    const textbox = screen.getByRole("textbox", { name: "Ask a question" })
    await user.type(textbox, "Cat")
    await user.keyboard("{Enter}")

    assertTrackingEvent(
      {
        type: TrackingEventType.Submit,
        blockId,
        value: "Cat",
        source: "input",
      },
      {
        type: TrackingEventType.Response,
        blockId,
        value: "AI Response",
      },
    )

    await user.keyboard("{Escape}")
    assertTrackingEvent({
      type: TrackingEventType.Close,
      blockId,
    })
  })
})
