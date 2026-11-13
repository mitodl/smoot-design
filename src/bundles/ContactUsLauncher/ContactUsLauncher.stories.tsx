import type { Meta, StoryObj } from "@storybook/nextjs"
import { http, HttpResponse, delay } from "msw"
import { ContactUsLauncher } from "./ContactUsLauncher"

const SUPPORT_API = "http://localhost:4567/support"
const PAGE_URL = "https://learn.mit.edu/courses/18.01/week-3"

const ASK_FOR_EMAIL =
  "Sorry that happened. What email address should the support team reply to?"
const ASK_MORE =
  "Thanks for letting us know. Is there anything else you'd like to add " +
  "before I pass this on to the MIT Open Learning support team?"
const TICKET_FILED =
  "Thanks - I've passed that on to the MIT Open Learning support team. Your " +
  "reference number is STUB-4F2A91, and they'll follow up at {email}."

const review = (description: string, email: string) =>
  [
    "Here's what I'll send to the support team:",
    "",
    `**Your message:** ${description}`,
    "",
    `**Where you were:** ${PAGE_URL}`,
    "",
    `**Reply to:** ${email}`,
    "",
    'Anything else to add? Send it and I\'ll include it - otherwise reply "send" ' +
      "and I'll pass this on.",
  ].join("\n")

type Intake = {
  email: string
  description: string[]
  awaitingSend: boolean
  // The answering story starts false and flips on a press; the intake-only
  // story is always collecting, so it starts true.
  escalated: boolean
}

const freshIntake = (escalated = true): Intake => ({
  email: "",
  description: [],
  awaitingSend: false,
  escalated,
})

let intake = freshIntake()

/**
 * Stands in for learn-ai's support bot across all three turns: ask for an
 * address, show the ticket for review, then file it on the turn after. The
 * review step is in learn-ai's code rather than its model, so a mock that files
 * the moment an address arrives would demo a flow the backend no longer has.
 */
const supportHandler = http.post(SUPPORT_API, async ({ request }) => {
  const { message, clear_history: clearHistory } = (await request.json()) as {
    message: string
    clear_history: boolean
  }
  // Each card session starts a new thread, so the mock forgets with it.
  if (clearHistory) {
    intake = freshIntake()
  }
  await delay(400)

  if (intake.awaitingSend) {
    const reply = TICKET_FILED.replace("{email}", intake.email)
    intake = freshIntake()
    return HttpResponse.text(reply)
  }

  const address = message.match(/\S+@\S+\.\S+/)?.[0]
  if (!address) {
    intake.description.push(message)
    return HttpResponse.text(ASK_FOR_EMAIL)
  }

  intake.email = address
  intake.awaitingSend = true
  return HttpResponse.text(review(intake.description.join("\n\n"), address))
})

const meta: Meta<typeof ContactUsLauncher> = {
  title: "smoot-design/AI/ContactUsLauncher",
  component: ContactUsLauncher,
  parameters: {
    msw: { handlers: [supportHandler] },
  },
  args: {
    settings: {
      chat: {
        apiUrl: SUPPORT_API,
        requestBody: { page_url: PAGE_URL },
      },
    },
  },
  argTypes: {
    settings: {
      // JSON controls break form submission via keyboard. See
      // https://github.com/storybookjs/storybook/issues/31881
      control: false,
    },
  },
}

export default meta

type Story = StoryObj<typeof ContactUsLauncher>

/**
 * The launcher is `position: fixed`, so it sits in the bottom-right of the
 * canvas rather than in the flow of the story. Click it to open the card,
 * describe a problem, then give an address. The card shows what it will send
 * before anything is filed; reply "send" (or add more) to get the reference.
 *
 * Narrow the canvas below 600px and the card goes full screen. It becomes a
 * modal at that point: the page behind is made `inert` and stops scrolling,
 * since none of it is visible or reachable. Host elements carrying the
 * `KEEP_INTERACTIVE` attribute (`data-contact-us-keep-interactive`) are left
 * alone.
 */
export const Default: Story = {}

export const CustomLabel: Story = {
  name: "Custom label",
  args: { label: "Get help" },
}

/**
 * The label renders as visible text beside the icon, as a pill. The accessible
 * name is the same either way, so this only changes what a sighted user sees.
 */
export const ShowLabel: Story = {
  name: "Label shown",
  args: { showLabel: true },
}

const ANSWER =
  "Your certificate is issued once the course ends and your grade is final, " +
  "usually within a few days of the end date.\n\nIf that doesn't match what " +
  "you're seeing, I can pass this to our support team."

/**
 * Stands in for the answering support bot. The first turn gets an answer and an
 * offer; a turn carrying `escalate` goes to intake instead, with the message
 * blanked the way learn-ai blanks it, so the press is what routes the thread
 * rather than the words the button happens to send.
 */
const answeringHandler = http.post(SUPPORT_API, async ({ request }) => {
  const {
    message,
    clear_history: clearHistory,
    escalate,
  } = (await request.json()) as {
    message: string
    clear_history: boolean
    escalate?: boolean
  }
  if (clearHistory) {
    intake = freshIntake(false)
  }
  await delay(400)

  if (escalate) {
    intake.escalated = true
    return HttpResponse.text(ASK_FOR_EMAIL)
  }
  if (!intake.escalated) {
    intake.description.push(message)
    return HttpResponse.text(ANSWER)
  }

  if (intake.awaitingSend) {
    const reply = TICKET_FILED.replace("{email}", intake.email)
    intake = freshIntake()
    return HttpResponse.text(reply)
  }

  const address = message.match(/\S+@\S+\.\S+/)?.[0]
  if (address) {
    intake.email = address
  } else {
    intake.description.push(message)
  }
  if (!intake.email) {
    return HttpResponse.text(ASK_FOR_EMAIL)
  }
  // A press on the greeting escalates before the learner has said anything.
  // learn-ai asks for more rather than show a review with no problem in it.
  if (intake.description.length === 0) {
    return HttpResponse.text(ASK_MORE)
  }

  intake.awaitingSend = true
  return HttpResponse.text(
    review(intake.description.join("\n\n"), intake.email),
  )
})

/**
 * The "Contact the support team" button sits under the greeting from the
 * start and follows the newest reply. Ask something the bot can answer
 * ("when do I get my certificate?") and it answers and offers a handoff —
 * or press the button right away. The request it causes carries
 * `escalate: true` for that one turn, which you can watch in the network
 * panel, and the turn after it is an ordinary one again.
 */
export const AnswersFirst: Story = {
  name: "Answers first",
  parameters: {
    msw: { handlers: [answeringHandler] },
  },
}

/**
 * The support endpoint 500s, so the card shows its error alert. Sending again
 * still starts a fresh thread, since the failed send never opened one.
 */
export const RequestFails: Story = {
  name: "Request fails",
  parameters: {
    msw: {
      handlers: [
        http.post(SUPPORT_API, () => new HttpResponse(null, { status: 500 })),
      ],
    },
  },
}
