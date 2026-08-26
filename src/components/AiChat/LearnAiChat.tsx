import * as React from "react"
import { AiChat } from "./AiChat"
import type { AiChatMessage, AiChatProps, RequestOpts } from "./types"

/**
 * `LearnAiChat` is an `AiChat` connected to one of learn-ai's chatbot agents.
 *
 * It owns everything about talking to learn-ai — the endpoint path for each
 * agent, the request body, cookies and CSRF — plus default screen copy and
 * conversation starters. Callers supply the deployment's base URL and the
 * agent's inputs; all `AiChat` display props pass through, and explicitly
 * passed props win over the defaults.
 *
 * For a chat that is not a learn-ai production agent (a dev harness, a
 * different backend), use `AiChat` directly.
 */

type ConversationStarters = NonNullable<AiChatProps["conversationStarters"]>

/**
 * Default conversation starters, keyed by what the chat is about. Exported
 * so consumers and their tests can reference the same copy.
 */
const LEARN_AI_STARTERS = {
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
  recommendation: [
    {
      content:
        "I'm interested in courses on quantum computing that offer certificates.",
    },
    {
      content:
        "I want to learn about global warming, can you recommend any videos?",
    },
    {
      content:
        "I would like to learn about linear regression, preferably at no cost.",
    },
  ],
} satisfies Record<string, ConversationStarters>

/**
 * Request bodies for learn-ai's agents. These match the corresponding
 * serializers in learn-ai (`ai_chatbots/serializers.py`); fields the agents
 * accept but production frontends never send (`model`, `temperature`,
 * `instructions`, ...) are omitted.
 */
type RecommendationChatRequestBody = {
  message: string
}

type SyllabusChatRequestBody = {
  message: string
  course_id: string
  collection_name: string
  related_courses?: string[]
}

type LearnAiChatCommonProps = Omit<AiChatProps, "requestOpts"> & {
  /**
   * Base URL of the learn-ai deployment, e.g. `https://api.learn.mit.edu/ai`
   * — its mount point, not just the origin — with no trailing slash. Agent
   * endpoint paths are appended internally.
   */
  baseUrl: string
  /**
   * Name of the cookie holding learn-ai's CSRF token, where it is not the
   * default `csrftoken`. Only useful on pages that can read learn-ai's
   * cookies; a frontend on an unrelated domain sends an empty token.
   */
  csrfCookieName?: string
}

type LearnAiChatProps =
  | (LearnAiChatCommonProps & {
      /** Recommends learning resources across MIT. */
      agent: "recommendation"
    })
  | (LearnAiChatCommonProps & {
      /** Answers questions about one resource's content. */
      agent: "syllabus"
      /**
       * The kind of resource under discussion. Selects the default entry
       * screen title and conversation starters; pass `entryScreenTitle` /
       * `conversationStarters` to override them.
       */
      about: "course" | "program"
      /**
       * Readable id of the resource under discussion. Sent as `course_id`,
       * and used as the default `chatId` so each resource gets its own
       * session.
       */
      courseId: string
      /**
       * Readable ids of child resources, e.g. the courses making up a
       * program. Sent as `related_courses` whenever given, an empty array
       * included.
       */
      relatedCourses?: string[]
    })

const AGENT_PATHS = {
  recommendation: "/http/recommendation_agent/",
  syllabus: "/http/syllabus_agent/",
} as const

/**
 * Messages are ordered oldest to newest, and the newest is the one being
 * asked.
 */
const latestMessageContent = (messages: AiChatMessage[]): string =>
  messages[messages.length - 1]?.content ?? ""

const requestOpts = (opts: {
  baseUrl: string
  agent: keyof typeof AGENT_PATHS
  csrfCookieName?: string
  transformBody: RequestOpts["transformBody"]
}): RequestOpts => ({
  apiUrl: `${opts.baseUrl}${AGENT_PATHS[opts.agent]}`,
  csrfCookieName: opts.csrfCookieName ?? "csrftoken",
  csrfHeaderName: "X-CSRFToken",
  fetchOpts: { credentials: "include" },
  transformBody: opts.transformBody,
})

const LearnAiChat: React.FC<LearnAiChatProps> = (props) => {
  if (props.agent === "syllabus") {
    const {
      agent,
      about,
      baseUrl,
      csrfCookieName,
      courseId,
      relatedCourses,
      ...aiChatProps
    } = props
    return (
      <AiChat
        chatId={courseId}
        entryScreenTitle={`What do you want to know about this ${about}?`}
        conversationStarters={LEARN_AI_STARTERS[about]}
        {...aiChatProps}
        requestOpts={requestOpts({
          agent,
          baseUrl,
          csrfCookieName,
          transformBody: (messages): SyllabusChatRequestBody => ({
            message: latestMessageContent(messages),
            course_id: courseId,
            collection_name: "content_files",
            ...(Array.isArray(relatedCourses)
              ? { related_courses: relatedCourses }
              : {}),
          }),
        })}
      />
    )
  }
  const { agent, baseUrl, csrfCookieName, ...aiChatProps } = props
  return (
    <AiChat
      entryScreenTitle="What do you want to learn from MIT?"
      askTimTitle="to recommend a course"
      conversationStarters={LEARN_AI_STARTERS.recommendation}
      {...aiChatProps}
      requestOpts={requestOpts({
        agent,
        baseUrl,
        csrfCookieName,
        transformBody: (messages): RecommendationChatRequestBody => ({
          message: latestMessageContent(messages),
        }),
      })}
    />
  )
}

export { LearnAiChat, LEARN_AI_STARTERS }
export type {
  LearnAiChatProps,
  RecommendationChatRequestBody,
  SyllabusChatRequestBody,
}
