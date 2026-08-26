import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import styled from "@emotion/styled"
import { LearnAiChat } from "./LearnAiChat"
import { handlers } from "./test-utils/api"

const Container = styled.div({
  width: "100%",
  height: "800px",
})

const meta: Meta<typeof LearnAiChat> = {
  title: "smoot-design/AI/LearnAiChat",
  component: LearnAiChat,
  parameters: {
    msw: { handlers },
  },
  decorators: (Story) => (
    <Container>
      <Story />
    </Container>
  ),
  args: {
    baseUrl: "http://localhost:4567/ai",
  },
}

export default meta

type Story = StoryObj<typeof LearnAiChat>

export const CourseSyllabus: Story = {
  args: {
    agent: "syllabus",
    about: "course",
    courseId: "18.06+spring_2023",
  },
}

export const ProgramSyllabus: Story = {
  args: {
    agent: "syllabus",
    about: "program",
    courseId: "program+v1",
    relatedCourses: ["18.06+spring_2023", "18.03+spring_2023"],
  },
}

export const Recommendation: Story = {
  args: {
    agent: "recommendation",
  },
}
