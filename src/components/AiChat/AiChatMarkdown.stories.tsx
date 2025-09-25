import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { AiChat } from "./AiChat"
import styled from "@emotion/styled"
import { handlers } from "./test-utils/api"

const TEST_API_STREAMING = "http://localhost:4567/streaming"
const TEST_API_STREAMING_MATH = "http://localhost:4567/streaming-math"

const Container = styled.div({
  width: "100%",
})

const meta: Meta<typeof AiChat> = {
  title: "smoot-design/AI/AiChat Markdown",
  component: AiChat,
  parameters: {
    msw: { handlers },
  },
  render: (args) => <AiChat {...args} />,
  decorators: (Story, context) => {
    return (
      <Container style={{ height: context.parameters.height || "500px" }}>
        <Story key={String(context.args.entryScreenEnabled)} />
      </Container>
    )
  },
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    askTimTitle: "to recommend a course",
    initialMessages: [
      {
        role: "assistant",
        content: `A simple ordered list:
1. Item 1
2. Item 3
3. Item 3`,
      },
    ],
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

export const Typical: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "user",
        content: "What is this course about?",
      },
      {
        role: "assistant",
        content: `Let me search for the core focus of this course.

Based on the search results, this course (The Human Brain) focuses on studying how the human brain implements core perceptual and cognitive abilities of the mind. Here are the main aspects of what the course covers:

Key Focus:
- Examines how different parts of the brain carry out specific cognitive and perceptual functions
- Studies the functional organization of the human brain and how it gives rise to mental abilities
- Explores the relationship between mind and brain

Specific Topics Covered:
1. Visual perception (color, shape, motion)
2. Recognition of faces, places, bodies, and words
3. Scene perception and navigation
4. Numerical understanding
5. Speech and music perception
6. Language comprehension
7. Understanding other minds (social cognition)

Main Approaches:
- Examines each mental function by:
  1. Understanding how it works in the mind (what is computed and how)
  2. Studying its brain basis (specialized machinery, information representation, timing)
- Uses multiple research methods including psychophysics, neuropsychology, fMRI, and other cognitive neuroscience techniques

Important Note:
The course emphasizes understanding principles rather than memorizing details, and takes students to the cutting edge of the field by having them read current research papers rather than textbooks. The professor notes that while it's called "The Human Brain," it focuses on cognitive neuroscience - understanding how the brain gives rise to mental functions, rather than purely biological aspects of the brain.

The course aims to help students understand both the big questions in the field and the methods used to answer them, while bringing them to the current frontiers of cognitive neuroscience research.`,
      },
    ],
  },
}

export const Textual: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `Here is a longer paragraph and **bold text** and *italic text*. Lorem ipsum dolor sit amet, consectetur adipiscing elit
sed do eiusmod tempor [incididunt](https://mit.edu) ut labore et dolore magna aliqua. Ut enim ad minim veniam.

And some inline code, \`\`<inline></inline>\`\` and code block:
\`\`\`
def f(x):
    print(x)
\`\`\``,
      },
    ],
  },
}

/**
 * Shows MathJax rendering of inline and block math.
 *
 * We set `startup.typeset` to false in the MathJax config as by default MathJax will typeset math anywhere on the page and outside of our components - the following should not appear typeset:
 * \\(x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)
 */
export const Math: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `Some inline math: $x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$

And some block math:
\n

$$
x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
$$

Math is rendered using MathJax only if the \`useMathJax\` prop is set to true.
`,
      },
    ],
    useMathJax: true,
  },
}

/**
 * Ensures that LaTeX delimiters `\\(...\\)` and `\\[...\\]`  are rendered correctly.
 *
 * better-react-mathjax expects TeX delimiters `$...$` or `$$...$$`, though the LLMs may produce LaTeX delimiters despite instruction.
 *
 */
export const MathLatexDelimiters: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `Some inline math: \\(x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)

And some block math:

\\[
x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
\\]

Math is rendered using MathJax only if the \`useMathJax\` prop is set to true.`,
      },
    ],
    useMathJax: true,
  },
}

/**
 * MathJax lazy loads packages for macros not included in its base package as it encounters them.
 *
 * The assistant response below includes some of these.
 *
 * - `\boldsymbol` - the boldsymbol package is autoloaded, however we have seen timing issues where the response is not typeset if the package does not load in time. As a result we have included it in the MathJax config to preload.
 *
 * - `ams` - the AMS package is included in the base MathJax package ([https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js](https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js)).
 *
 * - `physics` - the physics package is not autoloaded and will _not_ render by default. If we want to render physics symbols, we will need to include it in the MathJax config.
 *
 * `mathJaxConfig` is available as a prop. To load the physics package, we can set:
 *
 * ```tsx
 * mathJaxConfig: {
 *   loader: { load: ["[tex]/physics"] },
 *   tex: { packages: { "[+]": ["physics"] } },
 * }
 * ```
 *
 * Note that this does not demo alongside other stories as multiple \<MathJaxContext\> instances on the page share a single state.
 *
 * See [https://docs.mathjax.org/en/latest/input/tex/macros/index.html](https://docs.mathjax.org/en/latest/input/tex/macros/index.html)
 */
export const MathWithExtensionPackages: Story = {
  parameters: {
    height: "800px",
  },
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING_MATH },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content:
          "Ask me something and I'll respond with math that includes TeX symbols that are not in the base MathJax package",
      },
    ],
    useMathJax: true,
  },
}

export const SimpleOrderedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `A simple ordered list:
1. Item 1
2. Item 2
3. Item 3`,
      },
    ],
  },
}

export const SimpleUnorderedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `A simple unordered list:
- Item 1
- Item 2
- Item 3`,
      },
    ],
  },
}

export const NestedOrderedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `A nested ordered list:
1. Item 1
    1. Item 1.1
    2. Item 1.2
2. Item 2
    1. Item 2.1
    2. Item 2.2
3. Item 3
    1. Item 3.1
    2. Item 3.2`,
      },
    ],
  },
}

export const NestedUnorderedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `A nested unordered list:
- Item 1
    - Item 1.1
    - Item 1.2
- Item 2
    - Item 2.1
    - Item 2.2
- Item 3
    - Item 3.1
    - Item 3.2`,
      },
    ],
  },
}

export const NestedOrderedUnorderedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `A nested ordered and unordered list:
1. Item 1
    - Item 1.1
    - Item 1.2
2. Item 2
    - Item 2.1
    - Item 2.2
3. Item 3
    - Item 3.1
    - Item 3.2`,
      },
    ],
  },
}

export const NestedUnorderedOrderedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `A nested unordered and ordered list:
- Item 1
    1. Item 1.1
    2. Item 1.2
- Item 2
    1. Item 2.1
    2. Item 2.2
- Item 3
    1. Item 3.1
    2. Item 3.2`,
      },
    ],
  },
}

export const UnexpectedList: Story = {
  args: {
    requestOpts: { apiUrl: TEST_API_STREAMING },
    entryScreenEnabled: false,
    conversationStarters: [],
    initialMessages: [
      {
        role: "assistant",
        content: `LLMs may produce lists that are semantically nested, but do not reliably indent the markdown for the nested list items,
producing sibling ordered and unordered lists. We address this by assuming that if &lt;ul&gt; immediately follows &lt;ol&gt; in the DOM, it is a
"semantic sublist" of the last list item, and we style accordingly:

1. Item 1
- Semantic subitem 1.1
- Semantic subitem 1.2

2. Item 2
- Semantic subitem 2.1
- Semantic subitem 2.2`,
      },
    ],
  },
}
