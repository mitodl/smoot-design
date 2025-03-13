// This was giving false positives
/* eslint-disable testing-library/await-async-utils */
import { render, screen, waitFor } from "@testing-library/react"
import user from "@testing-library/user-event"
import { AiChat } from "./AiChat"
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
  })

  const setup = (props: Partial<AiChatProps> = {}) => {
    const initialMessages: AiChatProps["initialMessages"] = [
      { role: "assistant", content: faker.lorem.sentence() },
    ]
    const conversationStarters: AiChatProps["conversationStarters"] = [
      { content: faker.lorem.sentence() },
      { content: faker.lorem.sentence() },
    ]
    const view = render(
      <AiChat
        data-testid="ai-chat"
        initialMessages={initialMessages}
        conversationStarters={conversationStarters}
        requestOpts={{ apiUrl: API_URL }}
        placeholder="Type a message..."
        entryScreenEnabled={false}
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
          {...newProps}
        />,
      )
    }

    return { initialMessages, conversationStarters, rerender }
  }

  test("Clicking conversation starters and sending chats", async () => {
    const { initialMessages, conversationStarters } = setup()

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

    expect(transformBody).toHaveBeenCalledWith([
      expect.objectContaining(initialMessages[0]),
      expect.objectContaining({ content: "User message", role: "user" }),
    ])
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
})
