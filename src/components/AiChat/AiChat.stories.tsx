import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { AiChat } from "./AiChat"
import type { AiChatProps } from "./types"
import styled from "@emotion/styled"
import { fn } from "@storybook/test"
import { handlers } from "./test-utils/api"

const TEST_API_STREAMING = "http://localhost:4567/streaming"
const TEST_API_JSON = "http://localhost:4567/json"

const INITIAL_MESSAGES: AiChatProps["initialMessages"] = [
  {
    content: "Hi! What are you interested in learning about?",
    role: "assistant",
  },
  {
    content: "I need to brush up on my Calculus",
    role: "user",
  },
  {
    content:
      "Great! Do you want to start with the basics, like limits and derivatives, or jump into more advanced topics like integrals and series? Let me know how I can help!",
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
  height: "800px",
})

const meta: Meta<typeof AiChat> = {
  title: "smoot-design/AI/AiChat",
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
    askTimTitle: "to recommend a course",
    onClose: fn(),
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
  parameters: {
    msw: {
      handlers,
    },
  },
  // beforeEach: () => {
  //   const originalFetch = window.fetch
  //   window.fetch = (url, opts) => {
  //     if (url === TEST_API_STREAMING) {
  //       return mockStreaming()
  //     } else if (url === TEST_API_JSON) {
  //       return mockJson()
  //     }
  //     return originalFetch(url, opts)
  //   }
  // },
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
    title: "Chat with AI",
    requestOpts: { apiUrl: TEST_API_JSON },
    parseContent: (content: unknown) => {
      return JSON.parse(content as string).message
    },
  },
}
