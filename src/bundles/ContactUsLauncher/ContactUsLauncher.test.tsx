import * as React from "react"
import { act, render, screen, within } from "@testing-library/react"
import user from "@testing-library/user-event"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import { ContactUsLauncher, KEEP_INTERACTIVE } from "./ContactUsLauncher"
import { ThemeProvider } from "../../components/ThemeProvider/ThemeProvider"
import { setViewportWidth } from "../../test-utils/viewport"

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

const sendMessage = async (text: string) => {
  await user.click(
    screen.getByRole("textbox", { name: "Describe what you need" }),
  )
  await user.paste(text)
  await user.click(screen.getByRole("button", { name: "Send" }))
}

const openCard = async () => {
  await user.click(screen.getByRole("button", { name: "Contact us" }))
  return screen.findByRole("dialog", { name: "AskTIM" })
}

const closeCard = () =>
  user.click(screen.getByRole("button", { name: "Close" }))

const MOBILE_WIDTH = 375

const hostElements: HTMLElement[] = []

const hostElement = (attributes: Record<string, string> = {}) => {
  const element = document.createElement("div")
  Object.entries(attributes).forEach(([name, value]) =>
    element.setAttribute(name, value),
  )
  document.body.appendChild(element)
  hostElements.push(element)
  return element
}

afterEach(() => {
  hostElements.splice(0).forEach((element) => element.remove())
})

// AiChat repeats every message in an aria-live region, so text queries match
// twice. The transcript is the copy the learner reads.
const transcript = (card: HTMLElement) =>
  card.querySelector('[data-chat-role="assistant"]')

// jsdom never applies media queries to getComputedStyle, so the only way to see
// what the breakpoint declares is to read Emotion's injected rule back.
const mobileStyle = (element: HTMLElement) => {
  const classes = Array.from(element.classList)
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      const isCardBreakpoint =
        rule.cssText.includes("max-width:599.95px") &&
        classes.some((name) => rule.cssText.includes(name))
      if (isCardBreakpoint) {
        return (rule as CSSMediaRule).cssRules[0] as CSSStyleRule
      }
    }
  }
  return null
}

test("renders a labelled launcher button and no card until clicked", () => {
  renderLauncher()

  expect(screen.getByRole("button", { name: "Contact us" })).toBeInTheDocument()
  expect(screen.queryByRole("dialog")).toBeNull()
})

test("the launcher button is icon-only, named by its label rather than visible text", () => {
  renderLauncher()

  const launcher = screen.getByRole("button", { name: "Contact us" })
  expect(launcher).not.toHaveTextContent("Contact us")
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

test("opens on a greeting that says what the card will do", async () => {
  // Nothing on the way in says this files a support request: the learner
  // clicked a button labelled "Contact us" and landed on a chat box.
  renderLauncher()

  const card = await openCard()

  expect(transcript(card)).toHaveTextContent(/I'm AskTIM/)
  expect(transcript(card)).toHaveTextContent(/support team/)
})

test("marks the card as an AI assistant", async () => {
  // The greeting says AskTIM will pass the request on; the chip says the thing
  // answering is a model, which is why the disclaimer underneath applies.
  renderLauncher()

  const card = await openCard()

  expect(within(card).getByText("AI ASSISTANT")).toBeInTheDocument()
})

test("asks for a problem rather than a question", async () => {
  // "Ask a question" invites a question the support bot cannot answer. The
  // learner is describing something that went wrong.
  renderLauncher()

  const card = await openCard()

  expect(
    within(card).getByRole("textbox", { name: "Describe what you need" }),
  ).toBeInTheDocument()
})

test("opens into the conversation rather than an entry screen", async () => {
  // The entry screen has room for a heading and nothing else, so the greeting
  // has to be a message in the thread.
  renderLauncher()

  const card = await openCard()

  expect(within(card).queryByTestId("ai-chat-entry-screen")).toBeNull()
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

test("the full-screen mobile card sits above fixed host chrome", async () => {
  // Full screen, so the card's own header holds the only way out. At fab + 1
  // (1051) a host's fixed AppBar (zIndex.appBar, 1100) paints over the heading
  // and the Close button, and a phone has no Escape key to fall back on.
  renderLauncher()

  const style = mobileStyle(await openCard())?.style

  expect(style?.getPropertyValue("inset")).toBe("0")
  expect(style?.getPropertyValue("z-index")).toBe("1300")
})

test("announces the full-screen mobile card as a modal", async () => {
  // It covers the viewport, so a screen reader that keeps browsing the page
  // underneath is reading content the learner cannot see or reach.
  setViewportWidth(MOBILE_WIDTH)
  renderLauncher()

  expect(await openCard()).toHaveAttribute("aria-modal", "true")
})

test("leaves the desktop card non-modal", async () => {
  // It floats over a page that stays usable, and the click-away guard depends
  // on the learner being able to reach it.
  renderLauncher()

  expect(await openCard()).not.toHaveAttribute("aria-modal", "true")
})

test("takes the page behind the mobile card out of the tab and reading order", async () => {
  setViewportWidth(MOBILE_WIDTH)
  const host = hostElement()
  renderLauncher()

  await openCard()

  expect(host).toHaveAttribute("inert")
})

test("gives the page back when the mobile card closes", async () => {
  setViewportWidth(MOBILE_WIDTH)
  const host = hostElement()
  renderLauncher()

  await openCard()
  await closeCard()

  expect(host).not.toHaveAttribute("inert")
})

test("takes the page behind out of order when mounted inside the host's tree", async () => {
  // init({ container }) renders into the host's own element, so the page
  // behind is the siblings of each ancestor up to body, not body's children.
  setViewportWidth(MOBILE_WIDTH)
  const appRoot = hostElement()
  const content = document.createElement("div")
  const mountPoint = document.createElement("div")
  appRoot.append(content, mountPoint)
  render(<ContactUsLauncher settings={SETTINGS} />, {
    wrapper: ThemeProvider,
    container: mountPoint,
  })

  await openCard()

  expect(content).toHaveAttribute("inert")
  expect(appRoot).not.toHaveAttribute("inert")
})

test("leaves the page reachable behind the desktop card", async () => {
  const host = hostElement()
  renderLauncher()

  await openCard()

  expect(host).not.toHaveAttribute("inert")
})

test("spares host elements marked as staying interactive", async () => {
  // A host whose overlays portal into body needs a way to keep its own root
  // reachable; inerting it would freeze whatever it renders over us.
  setViewportWidth(MOBILE_WIDTH)
  const host = hostElement({ [KEEP_INTERACTIVE]: "" })
  renderLauncher()

  await openCard()

  expect(host).not.toHaveAttribute("inert")
})

test("leaves inert the host set itself", async () => {
  // Clearing everything on close would hand back interactivity the host had
  // deliberately taken away.
  setViewportWidth(MOBILE_WIDTH)
  const host = hostElement({ inert: "" })
  renderLauncher()

  await openCard()
  await closeCard()

  expect(host).toHaveAttribute("inert")
})

test("stops the page behind scrolling under the mobile card", async () => {
  // Touch scrolling that reaches the page underneath moves content the card
  // covers, and the learner gets back to a page scrolled somewhere else.
  setViewportWidth(MOBILE_WIDTH)
  renderLauncher()

  await openCard()

  expect(document.body.style.overflow).toBe("hidden")
})

test("restores the host's own overflow when the mobile card closes", async () => {
  setViewportWidth(MOBILE_WIDTH)
  document.body.style.overflow = "auto"
  renderLauncher()

  await openCard()
  await closeCard()

  expect(document.body.style.overflow).toBe("auto")
  document.body.style.overflow = ""
})

test("drops the modal semantics when the viewport grows past the breakpoint", async () => {
  // Rotating a phone, or the card outliving a resize on a tablet, leaves a
  // corner card with the whole page behind it inert.
  setViewportWidth(MOBILE_WIDTH)
  const host = hostElement()
  renderLauncher()
  const card = await openCard()

  await act(async () => {
    setViewportWidth(1024)
  })

  expect(card).not.toHaveAttribute("aria-modal", "true")
  expect(host).not.toHaveAttribute("inert")
  expect(document.body.style.overflow).toBe("")
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
  await user.click(
    screen.getByRole("textbox", { name: "Describe what you need" }),
  )
  await user.paste("my video will not play when I")
  await user.click(document.body)

  expect(screen.getByRole("dialog")).toBeInTheDocument()
})

test("lets a keyboard user tab out to the page without losing the draft", async () => {
  // The same reach for an error code the click-away guard protects, done by
  // keyboard. AiDrawer's slot variant traps Tab by default, which suits a
  // drawer that fills the page and not a card floating over a usable one: the
  // only way across would be Escape, which closes and takes the draft with it.
  renderLauncher()

  const card = await openCard()
  const hostButton = document.createElement("button")
  document.body.appendChild(hostButton)
  await user.click(
    screen.getByRole("textbox", { name: "Describe what you need" }),
  )
  await user.paste("my video stops at 3:41")

  const tabbable = Array.from(
    card.querySelectorAll<HTMLElement>("a[href], button, input, textarea"),
  ).filter((el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled)
  // Blurring the chat textarea updates MUI state, so this needs act.
  await act(async () => {
    tabbable[tabbable.length - 1].focus()
  })
  await user.tab()

  expect(card.contains(document.activeElement)).toBe(false)
  expect(screen.getByRole("dialog")).toBeInTheDocument()
  hostButton.remove()
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
  // Focus now sits in the chat textarea, so blurring it updates MUI state.
  await act(async () => {
    hostField.focus()
  })
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
  await user.click(
    screen.getByRole("textbox", { name: "Describe what you need" }),
  )
  await user.paste("my video stops at 3:41, error VID-421")
  await user.click(document.body)
  await user.keyboard("{Escape}")

  expect(screen.getByRole("dialog")).toBeInTheDocument()
})

test("lets the host replace the greeting", async () => {
  // The prop type accepts initialMessages, so a translated host string has to
  // win over the English default rather than being silently dropped.
  renderLauncher({
    settings: {
      chat: {
        ...SETTINGS.chat,
        initialMessages: [
          { role: "assistant" as const, content: "¿En qué podemos ayudarte?" },
        ],
      },
    },
  })

  const card = await openCard()

  expect(transcript(card)).toHaveTextContent("¿En qué podemos ayudarte?")
  expect(transcript(card)).not.toHaveTextContent(/I'm AskTIM/)
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

test.each([
  { showLabel: false, variant: "icon-only" },
  { showLabel: true, variant: "labelled" },
])(
  "a keyboard open leaves a visible focus ring on the $variant launcher's card",
  async ({ showLabel }) => {
    // Opening moves focus to the card's heading and hides the launcher. The
    // heading's outline is suppressed unless data-focus-ring is set, so without
    // this a keyboard user has no focus indicator anywhere (WCAG 2.4.7).
    renderLauncher({ showLabel })

    await user.tab()
    expect(screen.getByRole("button", { name: "Contact us" })).toHaveFocus()
    await user.keyboard("{Enter}")

    const heading = within(await screen.findByRole("dialog")).getByRole(
      "heading",
      { level: 1 },
    )
    expect(heading).toHaveFocus()
    expect(heading).toHaveAttribute("data-focus-ring")
  },
)

test("a mouse open leaves no focus ring", async () => {
  // The ring is for keyboard users; a pointer open would just show an outline
  // nobody asked for.
  renderLauncher()

  const heading = within(await openCard()).getByRole("heading", { level: 1 })

  expect(heading).not.toHaveAttribute("data-focus-ring")
})

test("accepts a custom label", () => {
  renderLauncher({ label: "Get help" })

  expect(screen.getByRole("button", { name: "Get help" })).toBeInTheDocument()
})

test("shows the label as visible text when showLabel is enabled", () => {
  renderLauncher({ showLabel: true })

  const launcher = screen.getByRole("button", { name: "Contact us" })
  expect(launcher).toHaveTextContent("Contact us")
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

test("a reopened card starts a fresh thread", async () => {
  // Closing and reopening is how a learner files a second request. Continuing
  // the first thread would put the new request behind the ticket already filed
  // against it, and the one-ticket-per-conversation guard would read back that
  // ticket's reference instead of filing another.
  const mockFetch = jest.spyOn(window, "fetch")
  renderLauncher()

  await openCard()
  await sendMessage("my video will not play")
  await screen.findAllByText(REPLY)
  await user.click(screen.getByRole("button", { name: "Close" }))

  await openCard()
  await sendMessage("my certificate has not arrived")

  expect(mockFetch).toHaveBeenLastCalledWith(
    TEST_API,
    expect.objectContaining({
      body: JSON.stringify({
        page_url: PAGE_URL,
        message: "my certificate has not arrived",
        clear_history: true,
      }),
    }),
  )
})

test("a retry after a failed send continues the same thread", async () => {
  // learn-ai mints a thread either way when none exists yet (no cookie to read
  // back), so the retry doesn't need a fresh clear_history to get one. Sending
  // true here would risk the opposite case instead: a response that filed a
  // ticket server-side but dropped before the client saw it finish. A retry
  // that cleared history then would hide that ticket in an abandoned thread
  // and let the support bot file a second one for the same request.
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
        clear_history: false,
      }),
    }),
  )
})
