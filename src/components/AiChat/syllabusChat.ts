/**
 * Shared configuration for learn-ai's syllabus agent.
 *
 * The syllabus agent is one specific learn-ai endpoint, consumed by more than
 * one frontend (MIT Learn and OCW). Its request contract lives here, next to
 * the response half of the same contract (`extractCommentsData` in ./utils and
 * the feedback endpoint in ./AiChatContext), so the two halves stay in step.
 *
 * Callers pass primitives rather than their own resource models, and are
 * expected to wrap this in whatever is idiomatic for them.
 */

import type { AiChatMessage, AiChatProps, RequestOpts } from "./types"

type ConversationStarters = NonNullable<AiChatProps["conversationStarters"]>

/**
 * Resource nouns that have their own set of syllabus conversation starters.
 */
type SyllabusResourceNoun = "course" | "program"

const SYLLABUS_STARTERS: Record<SyllabusResourceNoun, ConversationStarters> = {
  course: [
    { content: "What is this course about?" },
    { content: "What are the prerequisites for this course?" },
    { content: "How will this course be graded?" },
  ],
  program: [
    { content: "What is this program about?" },
    { content: "What are the prerequisites for this program?" },
    { content: "How will this program be graded?" },
  ],
}

const isSyllabusResourceNoun = (noun: string): noun is SyllabusResourceNoun =>
  noun in SYLLABUS_STARTERS

type SyllabusChatOptions = {
  /**
   * URL of learn-ai's syllabus agent, e.g.
   * `https://api.rc.learn.mit.edu/ai/http/syllabus_agent/`.
   */
  endpoint: string
  /**
   * Readable id of the resource whose syllabus is being discussed. Sent as
   * `course_id`, and used as the `chatId` so each resource gets its own
   * session.
   */
  courseId: string
  /**
   * Noun for the resource, used in the entry screen title and — when it is
   * one of `SYLLABUS_STARTERS`' keys — to pick the conversation starters.
   * Case-insensitive, so an API-supplied category can be passed as-is.
   */
  resourceNoun: string
  /**
   * Overrides the starter set implied by `resourceNoun`. Pass `null` for no
   * starters at all.
   */
  starters?: SyllabusResourceNoun | null
  /**
   * Readable ids of child resources, e.g. the courses making up a program.
   * Sent as `related_courses` whenever it is an array, empty included.
   */
  relatedCourses?: string[]
  /**
   * Cookie holding the CSRF token learn-ai expects. Defaults to `csrftoken`.
   *
   * Note this only works where the cookie is readable from the page's own
   * document — a frontend on a different domain than learn-ai will send an
   * empty token.
   */
  csrfCookieName?: string
}

type SyllabusChatRequestBody = {
  collection_name: string
  message: string
  course_id: string
  related_courses?: string[]
}

/**
 * The request body learn-ai's syllabus agent expects. Messages are ordered
 * oldest to newest, and the newest is the one being asked.
 */
const requestBody = (
  options: SyllabusChatOptions,
  messages: Pick<AiChatMessage, "content">[],
): SyllabusChatRequestBody => {
  const body: SyllabusChatRequestBody = {
    collection_name: "content_files",
    message: messages[messages.length - 1].content,
    course_id: options.courseId,
  }
  if (Array.isArray(options.relatedCourses)) {
    body.related_courses = options.relatedCourses
  }
  return body
}

const requestOpts = (options: SyllabusChatOptions): RequestOpts => ({
  apiUrl: options.endpoint,
  csrfCookieName: options.csrfCookieName || "csrftoken",
  csrfHeaderName: "X-CSRFToken",
  fetchOpts: { credentials: "include" },
  transformBody: (messages) => requestBody(options, messages),
})

const conversationStarters = (
  options: SyllabusChatOptions,
): ConversationStarters | undefined => {
  if (options.starters !== undefined) {
    return options.starters === null
      ? undefined
      : SYLLABUS_STARTERS[options.starters]
  }
  const noun = options.resourceNoun.toLocaleLowerCase()
  return isSyllabusResourceNoun(noun) ? SYLLABUS_STARTERS[noun] : undefined
}

/**
 * The `AiChat` props for a syllabus conversation about one resource. Spread
 * these onto `AiChat`; presentation (drawer, slide-down, ...) stays with the
 * caller.
 */
const getSyllabusChatProps = (
  options: SyllabusChatOptions,
): Pick<
  AiChatProps,
  "chatId" | "entryScreenTitle" | "conversationStarters" | "requestOpts"
> => ({
  chatId: options.courseId,
  entryScreenTitle: `What do you want to know about this ${options.resourceNoun.toLocaleLowerCase()}?`,
  conversationStarters: conversationStarters(options),
  requestOpts: requestOpts(options),
})

export { SYLLABUS_STARTERS, getSyllabusChatProps }
export type { SyllabusChatOptions, SyllabusResourceNoun }
