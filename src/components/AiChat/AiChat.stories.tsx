import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { AiChat } from "./AiChat"
import type { AiChatProps } from "./types"
import styled from "@emotion/styled"
import { handlers } from "./test-utils/api"
import { FC, useEffect, useRef, useState } from "react"

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
    entryScreenTitle: "What do you want to learn from MIT?",
    requestOpts: { apiUrl: TEST_API_STREAMING },
    conversationStarters: STARTERS,
    askTimTitle: "to recommend a course",
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
    requestOpts: { apiUrl: TEST_API_JSON },
    initialMessages: INITIAL_MESSAGES,
    entryScreenEnabled: false,
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
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: DEMO_MARKDOWN,
      },
    ],
  },
}

const ScrollComponent: FC<AiChatProps> = (args) => {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  )

  useEffect(() => {
    setScrollElement(ref.current)
  }, [])

  return (
    <div
      style={{
        width: "100%",
        height: "800px",
        overflow: "scroll",
        border: "2px solid #e0e6ea",
        position: "relative",
      }}
      ref={ref}
    >
      <AiChat {...args} scrollElement={scrollElement} />
    </div>
  )
}

/**
 * Where a scrollable container already exists, it can be passed in to the component
 * such as for use inside a modal or drawer.
 */
export const ScrollContainer: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        content: "Hi! What are you interested in learning about?",
        role: "assistant",
      },
      {
        content:
          "I'm looking for a course in computer science, but I'm not sure where to start.",
        role: "user",
      },
      {
        content:
          "I can help you find the right course! Could you tell me about your background? Have you done any programming before, and what are your goals?",
        role: "assistant",
      },
      {
        content:
          "I've done some basic Python programming, and I'm interested in AI and machine learning. I work full-time though, so I need something flexible.",
        role: "user",
      },
      {
        content:
          "Given your background and interests, I have a few recommendations:\n\n1. 6.0001 - Introduction to Computer Science and Programming in Python\n2. 6.0002 - Introduction to Computational Thinking and Data Science\n3. 6.036 - Introduction to Machine Learning\n\nAll these courses offer flexible online options. Would you like more details about any of these?",
        role: "assistant",
      },
      {
        content:
          "Yes, could you tell me more about the machine learning course? What are the prerequisites?",
        role: "user",
      },
      {
        content:
          "6.036 (Introduction to Machine Learning) requires:\n\n- Basic Python programming\n- Linear algebra fundamentals\n- Basic probability and statistics\n- Calculus I\n\nThe course covers:\n- Supervised learning\n- Neural networks\n- Deep learning basics\n- 12 weeks of content\n- 10-12 hours per week commitment\n\nGiven your Python background, you might need to brush up on math concepts first. Would you like me to suggest some preparatory courses?",
        role: "assistant",
      },
      {
        content: "Yes, what math courses would you recommend I take first?",
        role: "user",
      },
      {
        content:
          "Here are the recommended math prerequisites:\n\n1. 18.01 - Single Variable Calculus\n2. 18.06 - Linear Algebra\n3. 6.041 - Probability\n\nYou can take these online through our OpenCourseWare platform. Each course takes about 8-12 weeks. Would you like to start with any of these? I can provide more details about the course format and materials.",
        role: "assistant",
      },
      {
        content:
          "How long would it take to complete all the prerequisites before starting the ML course?",
        role: "user",
      },
      {
        content:
          "If you study part-time (10-15 hours per week):\n\n- Calculus: 12 weeks\n- Linear Algebra: 10 weeks\n- Probability: 8 weeks\n\nYou could complete them in:\n1. Sequential order: 7-8 months total\n2. Parallel study (2 courses at a time): 4-5 months\n\nMany students take Calculus and Linear Algebra together. Would you like to see a suggested study schedule?",
        role: "assistant",
      },
      {
        content:
          "Yes, a study schedule would be helpful. Also, are there any costs involved?",
        role: "user",
      },
      {
        content:
          "Here's the breakdown:\n\nCosts:\n- OpenCourseWare materials: Free\n- Optional verified certificate: $49-99 per course\n- Full ML course with certificate: $149\n\nSuggested Schedule (15 hrs/week):\nMonths 1-3:\n- Calculus (8 hrs/week)\n- Linear Algebra (7 hrs/week)\n\nMonths 4-5:\n- Probability (10 hrs/week)\n\nMonths 6-8:\n- ML course (12 hrs/week)\n\nWould you like me to help you enroll in any of these courses?",
        role: "assistant",
      },
      {
        content:
          "Can I start with just the Calculus course first to see how it goes?",
        role: "user",
      },
      {
        content:
          "Absolutely! That's a smart approach. 18.01 (Single Variable Calculus) has:\n\n- Flexible start dates\n- Self-paced learning\n- Video lectures\n- Practice problems\n- Online discussion forums\n- 24/7 access to materials\n\nYou can enroll right now and start today. Would you like the enrollment link and first week's syllabus?",
        role: "assistant",
      },
      {
        content:
          "Yes, please share the enrollment link. Also, will I have access to any tutoring support?",
        role: "user",
      },
      {
        content:
          "Yes! You'll have several support options:\n\n1. Teaching Assistants (TAs) available via:\n   - Discussion forums\n   - Weekly online office hours\n   - Email support\n\n2. Study Groups:\n   - Optional virtual study groups\n   - Peer-to-peer learning\n   - Weekly problem-solving sessions\n\nHere's your enrollment link: [Course Registration Link]\n\nWould you like me to connect you with a TA to discuss your study plan?",
        role: "assistant",
      },
      {
        content:
          "Not right now, but I might later. What happens if I find the course too difficult?",
        role: "user",
      },
      {
        content:
          "Don't worry! We have several options if you find the course challenging:\n\n1. You can:\n   - Pause your progress anytime\n   - Retake modules as needed\n   - Switch to a more basic math course\n   - Get extra tutoring support\n\n2. We also offer a 2-week trial period with a full refund if you decide it's not the right fit.\n\nWould you like to start with some preliminary practice problems to assess your readiness?",
        role: "assistant",
      },
      {
        content:
          "Yes, that would be helpful. Can you send me some practice problems?",
        role: "user",
      },
      {
        content:
          "I'll send you our Calculus readiness assessment. It covers:\n\n- Basic algebra\n- Functions and graphs\n- Trigonometry basics\n- Pre-calculus concepts\n\nYou can access it here: [Assessment Link]\n\nTake your time with it - there's no time limit. Once you complete it, I can provide personalized recommendations for where to start. Would you like to try it now?",
        role: "assistant",
      },
    ],
  },

  render: (args) => <ScrollComponent {...args} />,
}
