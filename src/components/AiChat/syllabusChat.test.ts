import { SYLLABUS_STARTERS, getSyllabusChatProps } from "./syllabusChat"
import type { AiChatMessage } from "./types"

const ENDPOINT = "https://api.test/ai/http/syllabus_agent/"

const messages = (...contents: string[]): AiChatMessage[] =>
  contents.map((content, index) => ({
    id: String(index),
    role: index % 2 === 0 ? "user" : "assistant",
    content,
  }))

describe("getSyllabusChatProps", () => {
  it("configures a chat session for the resource", () => {
    const props = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "6.001+fall_2024",
      resourceNoun: "course",
    })

    expect(props.chatId).toBe("6.001+fall_2024")
    expect(props.entryScreenTitle).toBe(
      "What do you want to know about this course?",
    )
    expect(props.conversationStarters).toBe(SYLLABUS_STARTERS.course)
    expect(props.requestOpts).toMatchObject({
      apiUrl: ENDPOINT,
      csrfCookieName: "csrftoken",
      csrfHeaderName: "X-CSRFToken",
      fetchOpts: { credentials: "include" },
    })
  })

  it("sends the newest message and the resource's readable id", () => {
    const { requestOpts } = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "6.001+fall_2024",
      resourceNoun: "course",
    })

    expect(
      requestOpts.transformBody?.(
        messages("First question", "First answer", "Latest question"),
      ),
    ).toEqual({
      collection_name: "content_files",
      message: "Latest question",
      course_id: "6.001+fall_2024",
    })
  })

  it("sends related_courses when given, empty array included", () => {
    const bodyFor = (relatedCourses: string[]) =>
      getSyllabusChatProps({
        endpoint: ENDPOINT,
        courseId: "program+v1",
        resourceNoun: "program",
        relatedCourses,
      }).requestOpts.transformBody?.(messages("Question"))

    expect(bodyFor([])).toHaveProperty("related_courses", [])
    expect(bodyFor(["6.001", "6.002"])).toHaveProperty("related_courses", [
      "6.001",
      "6.002",
    ])
  })

  it("accepts an API-supplied resource category in any case", () => {
    const props = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "program+v1",
      resourceNoun: "Program",
    })

    expect(props.entryScreenTitle).toBe(
      "What do you want to know about this program?",
    )
    expect(props.conversationStarters).toBe(SYLLABUS_STARTERS.program)
  })

  it("omits starters for a noun that has no starter set", () => {
    const props = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "video+1",
      resourceNoun: "Learning Material",
    })

    expect(props.entryScreenTitle).toBe(
      "What do you want to know about this learning material?",
    )
    expect(props.conversationStarters).toBeUndefined()
  })

  it("lets the caller override which starters are used", () => {
    const overridden = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "program+v1",
      resourceNoun: "Certificate Program",
      starters: "program",
    })
    expect(overridden.conversationStarters).toBe(SYLLABUS_STARTERS.program)

    const suppressed = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "6.001+fall_2024",
      resourceNoun: "course",
      starters: null,
    })
    expect(suppressed.conversationStarters).toBeUndefined()
  })

  it("uses a caller-supplied CSRF cookie name", () => {
    const { requestOpts } = getSyllabusChatProps({
      endpoint: ENDPOINT,
      courseId: "6.001+fall_2024",
      resourceNoun: "course",
      csrfCookieName: "learn_ai_csrftoken",
    })

    expect(requestOpts.csrfCookieName).toBe("learn_ai_csrftoken")
  })
})
