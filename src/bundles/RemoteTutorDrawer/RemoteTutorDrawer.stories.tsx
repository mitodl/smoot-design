/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import {
  RemoteTutorDrawer,
  RemoteTutorDrawerInitMessage,
} from "./RemoteTutorDrawer"
import invariant from "tiny-invariant"
import { handlers } from "../../components/AiChat/test-utils/api"

type InitPayload = RemoteTutorDrawerInitMessage["payload"]

const TEST_API_STREAMING = "http://localhost:4567/streaming"

const INITIAL_MESSAGES: InitPayload["chat"]["initialMessages"] = [
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

const buildIFrame = (payload: InitPayload) => (el: HTMLIFrameElement) => {
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
  textarea.style["height"] = "500px"

  const message: RemoteTutorDrawerInitMessage = {
    type: "smoot-design::tutor-drawer-open",
    payload,
  }
  textarea.value = JSON.stringify(message, null, 2)
  button.addEventListener("click", () => {
    parent.postMessage(JSON.parse(textarea.value))
  })
}

const IFrame = ({ payload }: { payload: InitPayload }) => {
  return (
    <iframe
      width="100%"
      height="600px"
      ref={buildIFrame(payload)}
      title="button frame"
    />
  )
}

const meta: Meta<typeof RemoteTutorDrawer> = {
  title: "smoot-design/AI/RemoteTutorDrawer",
  render: ({ blockType, target }) => (
    <>
      {blockType === "problem" ? (
        <IFrame
          payload={{
            blockType,
            target,
            chat: {
              askTimTitle: "for help with Problem: Derivatives 1.1",
              apiUrl: TEST_API_STREAMING,
              initialMessages: INITIAL_MESSAGES,
              conversationStarters: STARTERS,
            },
          }}
        />
      ) : null}
      {blockType === "video" ? (
        <IFrame
          payload={{
            blockType,
            target,
            chat: {
              apiUrl: TEST_API_STREAMING,
              initialMessages: INITIAL_MESSAGES,
              conversationStarters: STARTERS,
            },
            summary: {
              contentUrl: "https://www.google.com",
            },
          }}
        />
      ) : null}
      <RemoteTutorDrawer
        target={target}
        messageOrigin="http://localhost:6006"
      />
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
  render: ({ blockType, target }) => (
    <>
      <IFrame
        payload={{
          blockType,
          target,
          chat: {
            apiUrl: TEST_API_STREAMING,
            initialMessages: INITIAL_MESSAGES,
            conversationStarters: STARTERS,
          },
          summary: {
            contentUrl:
              "https://api.rc.learn.mit.edu/api/v1/contentfiles/16453238/",
          },
        }}
      />
      <RemoteTutorDrawer
        target={target}
        messageOrigin="http://localhost:6006"
      />
    </>
  ),
}
