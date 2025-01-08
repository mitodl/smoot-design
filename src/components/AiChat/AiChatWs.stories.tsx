import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { AiChatWs } from "./AiChatWs"
import type { AiChatProps } from "./types"
import styled from "@emotion/styled"
import { MockWebSocket } from "./story-utils"

const TEST_API_STREAMING =
  "ws://ai.open.odl.local:8002/ws/recommendation_agent/"

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

const meta: Meta<typeof AiChatWs> = {
  title: "smoot-design/ai/AiChatWS",
  component: AiChatWs,
  render: (args) => <AiChatWs {...args} />,
  decorators: (Story) => {
    return (
      <Container>
        <Story />
      </Container>
    )
  },
  args: {
    initialMessages: INITIAL_MESSAGES,
    requestOpts: {
      apiUrl: TEST_API_STREAMING,
      transformBody: (messages) => {
        return {
          message: messages[messages.length - 1].content,
        }
      },
    },
    conversationStarters: STARTERS,
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
    // @ts-expect-error This should only affect the story iframe
    window.WebSocket = MockWebSocket
    console.warn(
      `Alert! Global WebSocket replaced with Mock on frame: ${window.location.href}`,
    )
  },
}

export default meta

/**
 * A websocket version of the AiChat component.
 */
type Story = StoryObj<typeof AiChatWs>

export const StreamingResponses: Story = {}
