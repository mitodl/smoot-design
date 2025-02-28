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
  parameters: {
    msw: { handlers },
  },
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

const DEMO_MARKDOWN = `This shows default markdown styling. Here's a list:
- Item 1 lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
- Item 2
- Item 3
    - Item 3.1
    - Item 3.2
- Item 4
    1. Item 4.1
    2. Item 4.2
    3. Item 4.3

Here is a longer paragraph and **bold text** and *italic text*. Lorem ipsum dolor sit amet, consectetur adipiscing elit
sed do eiusmod tempor [incididunt](https://mit.edu) ut labore et dolore magna aliqua. Ut enim ad minim veniam.

And some inline code, \`\`<inline></inline>\`\` and code block:
\`\`\`
def f(x):
    print(x)
\`\`\`
`

/**
 * This story shows the component's builtin markdown styling.
 */
export const MarkdownStyling: Story = {
  args: {
    title: "Markdown Styles",
    requestOpts: { apiUrl: TEST_API_STREAMING },
    initialMessages: [
      {
        role: "assistant",
        content: DEMO_MARKDOWN,
      },
    ],
  },
}
