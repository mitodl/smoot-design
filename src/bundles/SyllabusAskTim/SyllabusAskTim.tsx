import * as React from "react"
import { AiChat } from "../../ai"
import type { AiChatProps } from "../../ai"

const initialMessages: AiChatProps["initialMessages"] = [
  {
    role: "assistant",
    content: "How can I help you today?",
  },
]

const SyllabusAskTim: React.FC<{
  courseId?: string
}> = ({ courseId = "course-v1:xPRO+PCDEx" }) => {
  const requestOpts: AiChatProps["requestOpts"] = {
    apiUrl: "https://api.rc.learn.mit.edu/ai/http/syllabus_agent/",
    transformBody: (messages) => {
      const body = {
        collection_name: "content_files",
        message: messages[messages.length - 1].content,
        course_id: courseId,
      }
      return body
    },
  }
  return (
    <AiChat
      entryScreenEnabled={false}
      askTimTitle="About this Course"
      initialMessages={initialMessages}
      requestOpts={requestOpts}
    />
  )
}

export default SyllabusAskTim
