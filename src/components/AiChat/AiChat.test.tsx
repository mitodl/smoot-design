// This was giving false positives
import { render, screen, waitFor } from "@testing-library/react"
import user from "@testing-library/user-event"
import { AiChat } from "./AiChat"
import { replaceMathjax } from "./Markdown"
import { ThemeProvider } from "../ThemeProvider/ThemeProvider"
import * as React from "react"
import { AiChatProps } from "./types"
import { faker } from "@faker-js/faker/locale/en"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const counter = jest.fn() // use jest.fn as counter because it resets on each test
const API_URL = "http://localhost:4567/test"
const server = setupServer(
  http.post(API_URL, async () => {
    const count = counter.mock.calls.length
    counter()
    return HttpResponse.text(`AI Response ${count}`)
  }),
  http.post(
    "http://localhost:4567/ai/api/v0/chat_sessions/:threadId/messages/:checkpointPk/rate/",
    async () => {
      return HttpResponse.json({ message: "Feedback received" })
    },
  ),
  http.post(
    "http://localhost:4567/feedback/:threadId/:checkpointPk",
    async () => {
      return HttpResponse.json({ message: "Feedback received" })
    },
  ),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

jest.mock("react-markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <div>{children}</div>,
  }
})

const msg = {
  ai: (text: string) => `Assistant said: ${text}`,
  you: (text: string) => `You said: ${text}`,
}

const getMessages = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll(".MitAiChat--message"))
}
const getConversationStarters = (): HTMLElement[] => {
  return Array.from(
    document.querySelectorAll("button.MitAiChat--conversationStarter"),
  )
}
const whenCount = async <T,>(cb: () => T[], count: number) => {
  return await waitFor(() => {
    const result = cb()
    expect(result).toHaveLength(count)
    return result
  })
}

describe("AiChat", () => {
  beforeEach(() => {
    const MockObserverInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }
    global.ResizeObserver = jest
      .fn()
      .mockImplementation(() => MockObserverInstance)

    document.cookie = ""
  })

  const setup = (props: Partial<AiChatProps> = {}) => {
    const initialMessages: AiChatProps["initialMessages"] = [
      { role: "assistant", content: faker.lorem.sentence() },
    ]
    const conversationStarters: AiChatProps["conversationStarters"] = [
      { content: faker.lorem.sentence() },
      { content: faker.lorem.sentence() },
    ]
    const onSubmit = jest.fn()
    const view = render(
      <AiChat
        data-testid="ai-chat"
        initialMessages={initialMessages}
        conversationStarters={conversationStarters}
        requestOpts={{ apiUrl: API_URL }}
        placeholder="Type a message..."
        entryScreenEnabled={false}
        onSubmit={onSubmit}
        {...props}
      />,
      { wrapper: ThemeProvider },
    )

    const rerender = (newProps: Partial<AiChatProps>) => {
      view.rerender(
        <AiChat
          data-testid="ai-chat"
          initialMessages={initialMessages}
          conversationStarters={conversationStarters}
          requestOpts={{ apiUrl: API_URL }}
          entryScreenEnabled={false}
          onSubmit={onSubmit}
          {...newProps}
        />,
      )
    }

    return { initialMessages, conversationStarters, rerender, onSubmit }
  }

  test("Clicking conversation starters and sending chats", async () => {
    const { initialMessages, conversationStarters, onSubmit } = setup()

    const scrollBy = jest.spyOn(HTMLElement.prototype, "scrollBy")

    const initialMessageEls = getMessages()
    expect(initialMessageEls.length).toBe(1)
    expect(initialMessageEls[0]).toHaveTextContent(initialMessages[0].content)

    const starterEls = getConversationStarters()
    expect(starterEls.length).toBe(2)
    expect(starterEls[0]).toHaveTextContent(conversationStarters[0].content)
    expect(starterEls[1]).toHaveTextContent(conversationStarters[1].content)

    const chosen = faker.helpers.arrayElement([0, 1])

    await user.click(starterEls[chosen])
    expect(scrollBy).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(
      conversationStarters[chosen].content,
      { source: "conversation-starter" },
    )
    scrollBy.mockReset()

    const messageEls = await whenCount(getMessages, 3)

    expect(messageEls[0]).toHaveTextContent(initialMessages[0].content)
    expect(messageEls[1]).toHaveTextContent(
      conversationStarters[chosen].content,
    )
    expect(messageEls[2]).toHaveTextContent("AI Response 0")

    await user.click(screen.getByPlaceholderText("Type a message..."))
    await user.paste("User message")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(scrollBy).toHaveBeenCalled()

    const afterSending = await whenCount(getMessages, 5)
    expect(afterSending[3]).toHaveTextContent("User message")
    expect(afterSending[4]).toHaveTextContent("AI Response 1")
    expect(onSubmit).toHaveBeenCalledWith("User message", { source: "input" })
  })

  test("Messages persist if chat has same chatId", async () => {
    const { rerender } = setup({ chatId: "test-123" })
    const starterEls = getConversationStarters()
    const chosen = faker.helpers.arrayElement([0, 1])

    await user.click(starterEls[chosen])
    await whenCount(getMessages, 3)

    // New chat ... starters should be shown
    rerender({ chatId: "test-345" })
    expect(getConversationStarters().length).toBeGreaterThan(0)
    await whenCount(getMessages, 1)

    // existing chat ... starters should not be shown, messages should be restored
    rerender({ chatId: "test-123" })
    expect(getConversationStarters().length).toBe(0)
    await whenCount(getMessages, 3)
  })

  test("transformBody is called before sending requests", async () => {
    const mockFetch = jest.spyOn(window, "fetch")
    const fakeBody = { message: faker.lorem.sentence() }
    const transformBody = jest.fn(() => fakeBody)
    const { initialMessages } = setup({
      requestOpts: { apiUrl: API_URL, transformBody },
    })

    await user.click(screen.getByPlaceholderText("Type a message..."))
    await user.paste("User message")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(transformBody).toHaveBeenCalledWith(
      [
        expect.objectContaining(initialMessages[0]),
        expect.objectContaining({ content: "User message", role: "user" }),
      ],
      {},
    )
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      API_URL,
      expect.objectContaining({
        body: JSON.stringify(fakeBody),
      }),
    )
  })

  test("parseContent is called on the API-received message content", async () => {
    const fakeBody = { message: faker.lorem.sentence() }
    const transformBody = jest.fn(() => fakeBody)
    const { initialMessages, conversationStarters } = setup({
      requestOpts: { apiUrl: API_URL, transformBody },
      parseContent: jest.fn((content) => `Parsed: ${content}`),
    })

    await user.click(getConversationStarters()[0])

    await whenCount(getMessages, initialMessages.length + 2)

    await user.click(screen.getByPlaceholderText("Type a message..."))
    await user.paste("User message")
    await user.click(screen.getByRole("button", { name: "Send" }))

    await whenCount(getMessages, initialMessages.length + 4)

    const messagesTexts = getMessages().map((el) => el.textContent)

    expect(messagesTexts).toEqual([
      msg.ai(initialMessages[0].content),
      msg.you(conversationStarters[0].content),
      msg.ai("Parsed: AI Response 0"),
      msg.you("User message"),
      msg.ai("Parsed: AI Response 1"),
    ])
  })

  test("Passes extra attributes to root", () => {
    const fakeBody = { message: faker.lorem.sentence() }
    const transformBody = jest.fn(() => fakeBody)
    setup({
      requestOpts: { apiUrl: API_URL, transformBody },
      parseContent: jest.fn((content) => `Parsed: ${content}`),
    })
    expect(screen.getByTestId("ai-chat")).toBeInTheDocument()
  })

  test("If the API returns an error, an alert is shown", async () => {
    setup()
    server.use(
      http.post(API_URL, async () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    await user.click(getConversationStarters()[0])

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("An unexpected error has occurred")
  })

  test("Shows the entry screen if entryScreenEnabled is true", async () => {
    setup({
      entryScreenEnabled: true,
      entryScreenTitle: "Entry Screen Title",
    })
    await expect(screen.getByText("Entry Screen Title")).toBeInTheDocument()
  })

  test("User can submit a prompt from the entry screen", async () => {
    const { onSubmit } = setup({
      entryScreenEnabled: true,
      entryScreenTitle: "Entry Screen Title",
      initialMessages: [],
      conversationStarters: [],
    })

    await user.click(screen.getByRole("textbox"))
    await user.paste("User message")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSubmit).toHaveBeenCalledWith("User message", { source: "input" })

    const messages = getMessages()
    expect(messages[0]).toHaveTextContent("User message")
  })

  test("User can click starter on the entry screen to submit a prompt", async () => {
    const { onSubmit } = setup({
      entryScreenEnabled: true,
      entryScreenTitle: "Entry Screen Title",
      initialMessages: [],
      conversationStarters: [{ content: "Starter 1" }],
    })

    await user.click(screen.getByRole("button", { name: "Starter 1" }))
    expect(onSubmit).toHaveBeenCalledWith("Starter 1", {
      source: "conversation-starter",
    })
    const messages = getMessages()
    expect(messages[0]).toHaveTextContent("Starter 1")
  })

  test("csrfCookieName and csrfHeaderName are used to set CSRF token if provided", async () => {
    const mockFetch = jest.spyOn(window, "fetch")
    const csrfCookieName = "my-csrf-cookie"
    const csrfHeaderName = "My-Csrf-Header"
    document.cookie = `${csrfCookieName}=test-csrf-token`
    setup({
      requestOpts: {
        apiUrl: API_URL,
        csrfCookieName,
        csrfHeaderName,
      },
    })

    await user.click(getConversationStarters()[0])

    expect(mockFetch).toHaveBeenCalledWith(
      API_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          [csrfHeaderName]: "test-csrf-token",
        }),
      }),
    )
  })

  test("User feedback calls the correct endpoint with data values from response comment", async () => {
    const mockFetch = jest.spyOn(window, "fetch")
    const { initialMessages } = setup({
      requestOpts: { apiUrl: API_URL },
    })

    server.use(
      http.post(API_URL, async () => {
        return HttpResponse.text(`Here is a response.

<!-- {"checkpoint_pk": 123, "thread_id": "f8a2b9c4e7d6f1a3b5c8e9d2f4a7b6c1"} -->`)
      }),
    )

    await user.click(getConversationStarters()[0])
    await whenCount(getMessages, initialMessages.length + 2)
    await user.click(screen.getByRole("button", { name: "Good response" }))

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4567/ai/api/v0/chat_sessions/f8a2b9c4e7d6f1a3b5c8e9d2f4a7b6c1/messages/123/rate/",
      expect.objectContaining({
        body: JSON.stringify({ rating: "like" }),
      }),
    )
  })

  test("User feedback calls the correct endpoint when supplied", async () => {
    const mockFetch = jest.spyOn(window, "fetch")
    const { initialMessages } = setup({
      requestOpts: {
        apiUrl: API_URL,
        feedbackApiUrl:
          "http://localhost:4567/feedback/:threadId/:checkpointPk",
      },
    })

    server.use(
      http.post(API_URL, async () => {
        return HttpResponse.text(`Here is a response.

<!-- {"checkpoint_pk": 123, "thread_id": "f8a2b9c4e7d6f1a3b5c8e9d2f4a7b6c1"} -->`)
      }),
    )

    await user.click(getConversationStarters()[0])
    await whenCount(getMessages, initialMessages.length + 2)
    await user.click(screen.getByRole("button", { name: "Bad response" }))

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4567/feedback/f8a2b9c4e7d6f1a3b5c8e9d2f4a7b6c1/123",
      expect.objectContaining({
        body: JSON.stringify({ rating: "dislike" }),
      }),
    )
  })
})

test("replaceMathjax replaces unsupported MathJax syntax", () => {
  const input = `Hello \\(E=mc^2\\) and \\(a^2 + b^2 = c^2\\). Also

  \\[
  F = ma
  \\]

  and

  \\[ PV = NkT \\]

  Bye now.
  `

  const expectedOutput = `Hello $E=mc^2$ and $a^2 + b^2 = c^2$. Also

  $$
  F = ma
  $$

  and

  $$ PV = NkT $$

  Bye now.
  `
  expect(replaceMathjax(input)).toBe(expectedOutput)
})
