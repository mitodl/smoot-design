import { render, screen, waitFor } from "@testing-library/react"
import user from "@testing-library/user-event"
import * as React from "react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { LearnAiChat, LEARN_AI_STARTERS } from "./LearnAiChat"
import type { LearnAiChatProps } from "./LearnAiChat"
import { ThemeProvider } from "../ThemeProvider/ThemeProvider"

const BASE_URL = "http://learn-ai.test/ai"

const requests: { url: string; body: unknown }[] = []
const server = setupServer(
  http.post(`${BASE_URL}/http/:agent/`, async ({ request }) => {
    requests.push({ url: request.url, body: await request.json() })
    return HttpResponse.text("AI Response")
  }),
)
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  requests.length = 0
})
afterAll(() => server.close())

jest.mock("react-markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <div>{children}</div>,
  }
})

type AgentProps<A extends LearnAiChatProps["agent"]> = Extract<
  LearnAiChatProps,
  { agent: A }
>

describe("LearnAiChat", () => {
  beforeEach(() => {
    const MockObserverInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }
    global.ResizeObserver = jest
      .fn()
      .mockImplementation(() => MockObserverInstance)
  })

  const setupSyllabus = (props: Partial<AgentProps<"syllabus">> = {}) => {
    render(
      <LearnAiChat
        agent="syllabus"
        about="course"
        baseUrl={BASE_URL}
        courseId="6.001+fall_2024"
        entryScreenEnabled={false}
        placeholder="Type a message..."
        {...props}
      />,
      { wrapper: ThemeProvider },
    )
  }

  const setupRecommendation = (
    props: Partial<AgentProps<"recommendation">> = {},
  ) => {
    render(
      <LearnAiChat
        agent="recommendation"
        baseUrl={BASE_URL}
        entryScreenEnabled={false}
        placeholder="Type a message..."
        {...props}
      />,
      { wrapper: ThemeProvider },
    )
  }

  const sendMessage = async (content: string) => {
    await user.click(screen.getByPlaceholderText("Type a message..."))
    await user.paste(content)
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => expect(requests).toHaveLength(1))
    return requests[0]
  }

  test("syllabus chats post the newest message and resource id to the syllabus agent", async () => {
    setupSyllabus()

    const request = await sendMessage("What are the prerequisites?")

    expect(request.url).toBe(`${BASE_URL}/http/syllabus_agent/`)
    expect(request.body).toEqual({
      message: "What are the prerequisites?",
      course_id: "6.001+fall_2024",
      collection_name: "content_files",
    })
  })

  test("syllabus chats send related_courses when given, empty array included", async () => {
    setupSyllabus({ courseId: "program+v1", relatedCourses: [] })

    const request = await sendMessage("What is this program about?")

    expect(request.body).toHaveProperty("related_courses", [])
  })

  test("syllabus copy follows the `about` discriminator", () => {
    setupSyllabus({
      about: "program",
      courseId: "8.01+fall_2025",
      entryScreenEnabled: true,
    })

    expect(
      screen.getByText("What do you want to know about this program?"),
    ).toBeInTheDocument()
    for (const starter of LEARN_AI_STARTERS.program) {
      expect(screen.getByText(starter.content)).toBeInTheDocument()
    }
  })

  test("explicitly passed copy wins over the `about` defaults", () => {
    setupSyllabus({
      courseId: "es.101+fall_2025",
      entryScreenEnabled: true,
      entryScreenTitle: "Ask about this offering",
      conversationStarters: [{ content: "How long does it take?" }],
    })

    expect(screen.getByText("Ask about this offering")).toBeInTheDocument()
    expect(screen.getByText("How long does it take?")).toBeInTheDocument()
    expect(
      screen.queryByText(LEARN_AI_STARTERS.course[0].content),
    ).not.toBeInTheDocument()
  })

  test("recommendation chats post only the newest message to the recommendation agent", async () => {
    setupRecommendation()

    const request = await sendMessage("I want to learn linear algebra.")

    expect(request.url).toBe(`${BASE_URL}/http/recommendation_agent/`)
    expect(request.body).toEqual({ message: "I want to learn linear algebra." })
  })

  test("recommendation chats default to recommendation copy", () => {
    setupRecommendation({ entryScreenEnabled: true })

    expect(
      screen.getByText("What do you want to learn from MIT?"),
    ).toBeInTheDocument()
    for (const starter of LEARN_AI_STARTERS.recommendation) {
      expect(screen.getByText(starter.content)).toBeInTheDocument()
    }
  })
})
