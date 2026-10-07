import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import user from "@testing-library/user-event"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import { ContactUsLauncher } from "./ContactUsLauncher"
import { ThemeProvider } from "../../components/ThemeProvider/ThemeProvider"

jest.mock("../../components/AiChat/Markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}))

jest.mock("better-react-mathjax", () => ({
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.ResizeObserver = MockResizeObserver

const TEST_API = "http://localhost:4567/support"
const PAGE_URL = "https://learn.mit.edu/courses/18.01/week-3"
const REPLY = "Thanks, what's a good email?"

const server = setupServer(
  // AiChat uses streamProtocol "text", so a plain text body is a valid stream.
  http.post(TEST_API, () => HttpResponse.text(REPLY)),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  window.history.pushState({}, "", "/")
})
afterAll(() => server.close())

const SETTINGS = {
  chat: {
    apiUrl: TEST_API,
    requestBody: { page_url: PAGE_URL },
  },
}

const renderLauncher = (props = {}) =>
  render(<ContactUsLauncher settings={SETTINGS} {...props} />, {
    wrapper: ThemeProvider,
  })

// The entry screen and the chat screen each have their own input. Only the
// chat screen's carries a placeholder, so target the shared accessible name.
const sendMessage = async (text: string) => {
  await user.click(screen.getByRole("textbox", { name: "Ask a question" }))
  await user.paste(text)
  await user.click(screen.getByRole("button", { name: "Send" }))
}

const openCard = async () => {
  await user.click(screen.getByRole("button", { name: "Contact us" }))
  return screen.findByRole("dialog", { name: "AskTIM" })
}

test("renders a labelled launcher button and no card until clicked", () => {
  renderLauncher()

  expect(screen.getByRole("button", { name: "Contact us" })).toBeInTheDocument()
  expect(screen.queryByRole("dialog")).toBeNull()
})

test("opens the card when the launcher is clicked", async () => {
  renderLauncher()

  await openCard()

  expect(screen.getByRole("heading", { name: "Ask TIM" })).toBeInTheDocument()
})

test("brands the card as AskTIM rather than repeating the launcher label", async () => {
  // The pill outside says "Contact us"; the bot answering inside is AskTIM.
  renderLauncher()

  const card = await openCard()

  expect(
    within(card)
      .getByRole("heading", { name: "Ask TIM" })
      .querySelector("strong"),
  ).toHaveTextContent("TIM")
  expect(card).not.toHaveTextContent("Contact us")
})

test("opens on the AskTIM entry screen, TIM logo and all", async () => {
  // AiDrawer defaults entryScreenEnabled to false for non-video blocks, which
  // left the card blank above the input. AskTIM's video drawer defaults it on.
  renderLauncher()

  const card = await openCard()

  const entry = within(card).getByTestId("ai-chat-entry-screen")
  expect(entry.querySelector("svg")).toBeInTheDocument()
})

test("drops the entry screen once the learner sends a message", async () => {
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")

  expect(screen.queryByTestId("ai-chat-entry-screen")).toBeNull()
})

test("closes the card again", async () => {
  renderLauncher()

  await openCard()
  await user.click(screen.getByRole("button", { name: "Close" }))

  expect(screen.queryByRole("dialog")).toBeNull()
})

test("opens as a card anchored in the corner, not a full-height drawer", async () => {
  renderLauncher()

  const style = getComputedStyle(await openCard())

  expect(style.position).toBe("fixed")
  expect(style.bottom).toBe("24px")
  expect(style.right).toBe("24px")
  expect(style.width).toBe("400px")
  expect(style.height).toBe("560px")
})

test("scrolls the card body once the conversation outgrows the card", async () => {
  renderLauncher()

  await openCard()

  // AiDrawer hands this element to AiChat as its scrollElement, which switches
  // the chat's own messages container to overflow:visible. The card is a fixed
  // 560px with overflow:hidden, so unless this element scrolls, anything past
  // the fold is clipped with no scrollbar and no way to reach it.
  expect(getComputedStyle(screen.getByRole("region")).overflowY).toBe("auto")
})

test("hides the launcher while the card covers it", async () => {
  renderLauncher()

  const launcher = screen.getByRole("button", { name: "Contact us" })
  await openCard()

  expect(getComputedStyle(launcher).visibility).toBe("hidden")
})

test("Escape closes the card", async () => {
  renderLauncher()

  await openCard()
  await user.keyboard("{Escape}")

  expect(screen.queryByRole("dialog")).toBeNull()
})

test("a click outside closes the card", async () => {
  // The card is non-modal, so there is no backdrop to catch this click.
  renderLauncher()

  await openCard()
  await user.click(document.body)

  expect(screen.queryByRole("dialog")).toBeNull()
})

test("a click outside leaves the card open once the learner has typed something", async () => {
  // Losing a half-written description to a stray click is the same loss as
  // losing a sent one: the learner clicks the page to copy an error code and
  // comes back to a blank card, because the text lives in unmounted state.
  renderLauncher()

  await openCard()
  await user.click(screen.getByRole("textbox", { name: "Ask a question" }))
  await user.paste("my video will not play when I")
  await user.click(document.body)

  expect(screen.getByRole("dialog")).toBeInTheDocument()
})

test("Escape is ignored while focus sits outside the card", async () => {
  // After a send the card deliberately survives an outside click, so the
  // learner can use the page underneath. Escape aimed at a host dropdown or
  // autofill must not take the transcript with it. AiDrawer gates its own slot
  // Escape on focus too, though it has no body fallback.
  const hostField = document.createElement("input")
  document.body.appendChild(hostField)
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")
  hostField.focus()
  await user.keyboard("{Escape}")

  expect(screen.getByRole("dialog")).toBeInTheDocument()
  hostField.remove()
})

test("defaults the page URL to the current page when the host sends none", async () => {
  // The ticket has to record where the learner was without asking them. A host
  // that only configures apiUrl would otherwise file every ticket with no page.
  const mockFetch = jest.spyOn(window, "fetch")
  render(<ContactUsLauncher settings={{ chat: { apiUrl: TEST_API } }} />, {
    wrapper: ThemeProvider,
  })

  await openCard()
  await sendMessage("my video will not play")

  expect(mockFetch).toHaveBeenCalledWith(
    TEST_API,
    expect.objectContaining({
      body: JSON.stringify({
        page_url: window.location.href,
        message: "my video will not play",
        clear_history: true,
      }),
    }),
  )
})

test("reads the page URL at send time, not at mount", async () => {
  // A host that routes client-side changes the URL under a card init() renders
  // only once. The move has to happen while the card is already open, or this
  // also passes against an implementation that captures the URL at open time.
  const mockFetch = jest.spyOn(window, "fetch")
  render(<ContactUsLauncher settings={{ chat: { apiUrl: TEST_API } }} />, {
    wrapper: ThemeProvider,
  })

  await openCard()
  window.history.pushState({}, "", "/courses/18.01/week-9")
  await sendMessage("my video will not play")

  expect(mockFetch).toHaveBeenCalledWith(
    TEST_API,
    expect.objectContaining({
      body: JSON.stringify({
        page_url: window.location.href,
        message: "my video will not play",
        clear_history: true,
      }),
    }),
  )
})

test("Escape spares a draft when it was not aimed at the card", async () => {
  // The same loss the click-away guard prevents: the learner clicks the page to
  // read an error code off it, which leaves focus on body, and Escape aimed at
  // nothing in particular would take the description with it.
  renderLauncher()

  await openCard()
  await user.click(screen.getByRole("textbox", { name: "Ask a question" }))
  await user.paste("my video stops at 3:41, error VID-421")
  await user.click(document.body)
  await user.keyboard("{Escape}")

  expect(screen.getByRole("dialog")).toBeInTheDocument()
})

test("lets the host override the entry screen title", async () => {
  // The prop type accepts entryScreenTitle, so a translated host string has to
  // win over the English default rather than being silently dropped.
  renderLauncher({
    settings: {
      chat: { ...SETTINGS.chat, entryScreenTitle: "¿En qué podemos ayudarte?" },
    },
  })

  const card = await openCard()

  expect(
    within(card).getByText("¿En qué podemos ayudarte?"),
  ).toBeInTheDocument()
})

test("a click outside leaves the card open once a message has been sent", async () => {
  // Dismissing by accident would throw away a support request the learner has
  // already started; past that point only the close button and Escape close it.
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")
  await user.click(document.body)

  expect(screen.getByRole("dialog")).toBeInTheDocument()
})

test("Escape still closes the card after a message has been sent", async () => {
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")
  await user.keyboard("{Escape}")

  expect(screen.queryByRole("dialog")).toBeNull()
})

test("a click inside leaves the card open", async () => {
  renderLauncher()

  await openCard()
  await user.click(screen.getByRole("heading", { name: "Ask TIM" }))

  expect(screen.getByRole("dialog")).toBeInTheDocument()
})

test("returns focus to the launcher when the card closes", async () => {
  renderLauncher()

  await openCard()
  await user.click(screen.getByRole("button", { name: "Close" }))

  expect(screen.getByRole("button", { name: "Contact us" })).toHaveFocus()
})

test("accepts a custom label", () => {
  renderLauncher({ label: "Get help" })

  expect(screen.getByRole("button", { name: "Get help" })).toBeInTheDocument()
})

test("the launcher is fixed-positioned so it floats over page content", () => {
  renderLauncher()

  const button = screen.getByRole("button", { name: "Contact us" })
  expect(getComputedStyle(button).position).toBe("fixed")
})

test("posts the learn-ai request shape, not the raw messages array", async () => {
  // AiDrawer's transformBody defaults to identity, which would spread the
  // Vercel messages array into index keys and be rejected by learn-ai's
  // ChatRequestSerializer. The launcher must supply the transform itself.
  const mockFetch = jest.spyOn(window, "fetch")
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")

  expect(mockFetch).toHaveBeenCalledWith(
    TEST_API,
    expect.objectContaining({
      body: JSON.stringify({
        page_url: PAGE_URL,
        message: "my video will not play",
        clear_history: true,
      }),
    }),
  )
})

test("only the first message of a session clears history", async () => {
  // The thread cookie outlives the drawer, so each session starts a fresh
  // thread; without this a learner returning later is read back a stale
  // ticket reference by the one-ticket-per-conversation guard.
  const mockFetch = jest.spyOn(window, "fetch")
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")
  // Also announced by the live region, hence findAll.
  await screen.findAllByText(REPLY)
  await sendMessage("it buffers forever")

  expect(mockFetch).toHaveBeenLastCalledWith(
    TEST_API,
    expect.objectContaining({
      body: JSON.stringify({
        page_url: PAGE_URL,
        message: "it buffers forever",
        clear_history: false,
      }),
    }),
  )
})

test("a retry after a failed send still clears history", async () => {
  // A send that errored never started a thread, so the retry is still the first
  // message of this session. Counting user messages instead would drop the
  // retry into the previous visit's thread, whose ticket is already filed.
  server.use(http.post(TEST_API, () => new HttpResponse(null, { status: 500 })))
  const mockFetch = jest.spyOn(window, "fetch")
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")
  await screen.findByText("An unexpected error has occurred.")

  server.use(http.post(TEST_API, () => HttpResponse.text(REPLY)))
  await sendMessage("my video will not play")

  expect(mockFetch).toHaveBeenLastCalledWith(
    TEST_API,
    expect.objectContaining({
      body: JSON.stringify({
        page_url: PAGE_URL,
        message: "my video will not play",
        clear_history: true,
      }),
    }),
  )
})
