import type { Meta, StoryObj } from "@storybook/nextjs"
import { http, HttpResponse, delay } from "msw"
import { ContactUsLauncher } from "./ContactUsLauncher"

const SUPPORT_API = "http://localhost:4567/support"
const PAGE_URL = "https://learn.mit.edu/courses/18.01/week-3"

const ASK_FOR_EMAIL =
  "Sorry that happened. What email address should the support team reply to?"
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

type Intake = { email: string; description: string[]; awaitingSend: boolean }

const freshIntake = (): Intake => ({
  email: "",
  description: [],
  awaitingSend: false,
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
 */
export const Default: Story = {}

export const CustomLabel: Story = {
  name: "Custom label",
  args: { label: "Get help" },
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
