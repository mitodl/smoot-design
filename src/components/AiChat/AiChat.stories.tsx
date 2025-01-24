import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { AiChat } from "./AiChat"
import type { AiChatProps } from "./types"
import { mockJson, mockStreaming } from "./story-utils"
import styled from "@emotion/styled"

const TEST_API_STREAMING = "http://localhost:4567/streaming"
const TEST_API_JSON = "http://localhost:4567/json"

const INITIAL_MESSAGES: AiChatProps["initialMessages"] = [
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

const Container = styled.div({
  width: "100%",
  height: "350px",
})

const meta: Meta<typeof AiChat> = {
  title: "smoot-design/AiChat",
  component: AiChat,
  render: (args) => <AiChat {...args} />,
  decorators: (Story) => {
    return (
      <Container>
        <Story />
      </Container>
    )
  },
  args: {
    initialMessages: INITIAL_MESSAGES,
    requestOpts: { apiUrl: TEST_API_STREAMING },
    conversationStarters: STARTERS,
    title: "Chat with AI",
  },
  argTypes: {
    conversationStarters: {
      control: { type: "object", disable: true },
    },
    initialMessages: {
      control: { type: "object", disable: true },
    },
    requestOpts: {
      control: { type: "object", disable: true },
      table: { readonly: true }, // See above
    },
  },
  beforeEach: () => {
    const originalFetch = window.fetch
    window.fetch = (url, opts) => {
      if (url === TEST_API_STREAMING) {
        return mockStreaming()
      } else if (url === TEST_API_JSON) {
        return mockJson()
      }
      return originalFetch(url, opts)
    }
  },
}

export default meta

type Story = StoryObj<typeof AiChat>

export const StreamingResponses: Story = {}

/**
 * Here `AiChat` is used with a non-streaming JSON API. The JSON is converted
 * to text via `parseContent`.
 */
export const JsonResponses: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_JSON },
    parseContent: (content: unknown) => {
      return JSON.parse(content as string).message
    },
  },
}
