/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import {
  RemoteTutorDrawer,
  ChatInitMessage,
  RemoteTutorDrawerProps,
} from "./RemoteTutorDrawer"
import invariant from "tiny-invariant"
import { handlers } from "../../components/AiChat/test-utils/api"

type ChatInitPayload = ChatInitMessage["payload"]

const TEST_API_STREAMING = "http://localhost:4567/streaming"

const INITIAL_MESSAGES: ChatInitPayload["initialMessages"] = [
  {
    content: "Hi! What are you interested in learning about?",
    role: "assistant",
  },
]

const STARTERS = [
  { content: "I'm interested in quantum computing" },
  { content: "I want to understand global warming. " },
  { content: "I am curious about AI applications for business" },
]

const buildIFrame =
  (payload: { blockType?: "problem" | "video"; target?: string }) =>
  (el: HTMLIFrameElement) => {
    if (!el) return
    const doc = el.contentDocument
    const parent = el.contentWindow?.parent
    invariant(doc && parent)
    const button = doc.createElement("button")

    button.textContent = "Trigger chat (Send message to parent)"
    doc.body.appendChild(button)

    const div = doc.createElement("div")
    doc.body.appendChild(div)

    const label = doc.createElement("label")
    label.textContent = "Message Data:"
    div.appendChild(label)

    const textarea = doc.createElement("textarea")
    div.append(textarea)
    textarea.style["display"] = "block"
    textarea.style["width"] = "100%"
    textarea.style["height"] = "225px"
    const message: ChatInitMessage = {
      type: "smoot-design::chat-open",
      payload: {
        askTimTitle: "for help with Problem: Derivatives 1.1",
        apiUrl: TEST_API_STREAMING,
        initialMessages: INITIAL_MESSAGES,
        conversationStarters: STARTERS,
        ...payload,
      },
    }
    textarea.value = JSON.stringify(message, null, 2)
    button.addEventListener("click", () => {
      parent.postMessage(JSON.parse(textarea.value))
    })
  }

const IFrame = ({ blockType, target }: RemoteTutorDrawerProps) => {
  return (
    <iframe
      width="600px"
      height="300px"
      ref={buildIFrame({ blockType, target })}
      title="button frame"
    />
  )
}

const meta: Meta<typeof RemoteTutorDrawer> = {
  title: "smoot-design/AI/RemoteTutorDrawer",
  render: (props) => (
    <>
      <IFrame {...props} />
      <RemoteTutorDrawer {...props} messageOrigin="http://localhost:6006" />
    </>
  ),
  parameters: {
    msw: {
      handlers,
    },
  },
}

export default meta

type Story = StoryObj<typeof RemoteTutorDrawer>

export const ProblemStory: Story = {
  args: {
    blockType: "problem",
    target: "problem-frame",
  },
}

export const VideoStory: Story = {
  args: {
    blockType: "video",
    target: "video-frame",
  },
}
