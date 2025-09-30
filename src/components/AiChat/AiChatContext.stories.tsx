import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { AiChatDisplay } from "./AiChat"
import { AiChatProvider, useAiChat } from "./AiChatContext"
import type { AiChatProps } from "./types"
import styled from "@emotion/styled"
import { handlers } from "./test-utils/api"
import Typography from "@mui/material/Typography"

const TEST_API_STREAMING = "http://localhost:4567/streaming"

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
  height: "700px",
  position: "relative",
  fontFamily: "neue-haas-grotesk-text, sans-serif",
})

const MessageCounter = () => {
  const { messages } = useAiChat()

  return (
    <Typography variant="subtitle1">
      Message count: {messages.length} (Provided by <code>AiChatContext</code>)
    </Typography>
  )
}

const LastMessageData = () => {
  const { messages } = useAiChat()

  const lastMessage = messages[messages.length - 1]

  if (!lastMessage) return null

  const { data } = lastMessage

  if (!data) return null

  return (
    <>
      <Typography variant="subtitle1">Last message data:</Typography>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {value.toString()}
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * AiChatProvider provides state and functions for managing chat. The higher-level
 * `AiChat` component is a wrapper around this provider and the `AiChatDisplay`,
 *  roughly.
 *
 * If you need to access chat state outside of the chat display, you can use
 * `AiChatProvider` directly.
 */
const meta: Meta<typeof AiChatProvider> = {
  title: "smoot-design/AI/AiChatContext",
  component: AiChatProvider,
  parameters: {
    msw: { handlers },
  },
  render: (args) => {
    return (
      <AiChatProvider {...args}>
        <MessageCounter />
        <LastMessageData />
        <Container>
          <AiChatDisplay
            entryScreenEnabled={false}
            conversationStarters={STARTERS}
            placeholder="Type your message here"
            askTimTitle="Ask TIM"
          />
        </Container>
      </AiChatProvider>
    )
  },
  decorators: (Story) => {
    return (
      <Container>
        <Story />
      </Container>
    )
  },
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    initialMessages: INITIAL_MESSAGES,
  },
  argTypes: {
    initialMessages: {
      control: { type: "object", disable: true },
    },
    requestOpts: {
      control: { type: "object", disable: true },
      table: { readonly: true }, // See above
    },
  },
}

export default meta

type Story = StoryObj<typeof AiChatProvider>

export const StreamingResponses: Story = {}
