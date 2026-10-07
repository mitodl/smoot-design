import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { http, HttpResponse, delay } from "msw"
import { ContactUsLauncher } from "./ContactUsLauncher"

const SUPPORT_API = "http://localhost:4567/support"
const PAGE_URL = "https://learn.mit.edu/courses/18.01/week-3"

const ASK_FOR_EMAIL =
  "Sorry that happened. What email address should the support team reply to?"
const TICKET_FILED =
  "Thanks - your request is filed as **STUB-4F2A91** and support will email you."

/**
 * Stands in for learn-ai's support bot: it asks for an address, then confirms
 * the ticket once it has one. Good enough to walk the whole intake flow.
 */
const supportHandler = http.post(SUPPORT_API, async ({ request }) => {
  const { message } = (await request.json()) as { message: string }
  await delay(400)
  return HttpResponse.text(message.includes("@") ? TICKET_FILED : ASK_FOR_EMAIL)
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
 * describe a problem, then give an address to see the ticket confirmation.
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
