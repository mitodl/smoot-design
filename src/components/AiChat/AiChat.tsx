import * as React from "react"
import { useEffect, useRef, useState, useMemo } from "react"
import type { FC } from "react"
import styled from "@emotion/styled"
import Typography from "@mui/material/Typography"
import classNames from "classnames"
import { RiSendPlaneFill, RiStopFill, RiMoreFill } from "@remixicon/react"
import { Input, AdornmentButton } from "../Input/Input"
import type { AiChatMessage, AiChatProps } from "./types"
import { EntryScreen } from "./EntryScreen"
import Markdown from "react-markdown"

import { ScrollSnap } from "../ScrollSnap/ScrollSnap"
import { SrAnnouncer } from "../SrAnnouncer/SrAnnouncer"
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden"
import { Alert } from "../Alert/Alert"
import { ChatTitle } from "./ChatTitle"
import { useAiChat } from "./utils"
import { useScrollSnap } from "../ScrollSnap/useScrollSnap"
import rehypeMathjax  from 'rehype-mathjax/svg'
import remarkMath from 'remark-math'

const classes = {
  root: "MitAiChat--root",
  title: "MitAiChat--title",
  entryScreenContainer: "MitAiChat--entryScreenContainer",
  conversationStarter: "MitAiChat--conversationStarter",
  chatScreenContainer: "MitAiChat--chatScreenContainer",
  messagesContainer: "MitAiChat--messagesContainer",
  messageRow: "MitAiChat--messageRow",
  messageRowUser: "MitAiChat--messageRowUser",
  messageRowAssistant: "MitAiChat--messageRowAssistant",
  message: "MitAiChat--message",
  input: "MitAiChat--input",
  bottomSection: "MitAiChat--bottomSection",
}

const Container = styled.div()

const ChatScreen = styled.div<{ externalScroll: boolean }>(
  ({ externalScroll, theme }) => ({
    padding: "16px 32px 0",
    [theme.breakpoints.down("md")]: {
      padding: "16px 16px 0",
    },
    boxSizing: "border-box",
    background: "white",
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    ...(externalScroll && {
      padding: "0 32px",
      [theme.breakpoints.down("md")]: {
        padding: "0 16px",
      },
    }),
  }),
)

const ChatContainer = styled.div<{ externalScroll: boolean }>(
  ({ externalScroll }) => ({
    width: "100%",
    height: externalScroll ? "auto" : "100%",
    minHeight: externalScroll ? "100%" : "auto",
    display: "flex",
    flexDirection: "column",
  }),
)

const MessagesContainer = styled(ScrollSnap)<{ externalScroll: boolean }>(
  ({ externalScroll }) => ({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: "14px 0",
    overflow: externalScroll ? "visible" : "auto",
    gap: "16px",
  }),
)

const MessageRow = styled.div({
  display: "flex",
  width: "100%",
  gap: "10px",
  [`&.${classes.messageRowUser}`]: {
    flexDirection: "row-reverse",
  },
  "> *": {
    minWidth: 0,
  },
  position: "relative",
})

const Message = styled.div(({ theme }) => ({
  color: theme.custom.colors.darkGray2,
  backgroundColor: theme.custom.colors.white,
  padding: "12px 16px",
  ...theme.typography.body2,
  "p:first-of-type": {
    marginTop: 0,
  },
  "p:last-of-type": {
    marginBottom: 0,
  },
  "ol, ul": {
    paddingInlineStart: "32px",
    li: {
      margin: "16px 0",
    },
  },
  ul: {
    marginInlineStart: "-16px",
  },
  a: {
    color: theme.custom.colors.red,
    fontWeight: "normal",
  },
  borderRadius: "12px",
  [`.${classes.messageRowAssistant} &`]: {
    padding: "12px 16px 12px 0",
  },
  [`.${classes.messageRowUser} &`]: {
    borderRadius: "8px 0px 8px 8px",
    backgroundColor: theme.custom.colors.lightGray1,
  },
}))

const StarterContainer = styled.div({
  alignSelf: "flex-end",
  alignItems: "end",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
})

const Starter = styled.button(({ theme }) => ({
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  backgroundColor: theme.custom.colors.white,
  padding: "8px 16px",
  ...theme.typography.body3,
  cursor: "pointer",
  boxSizing: "border-box",
  "&:hover": {
    color: theme.custom.colors.white,
    backgroundColor: theme.custom.colors.silverGrayDark,
    borderColor: "transparent",
  },
  borderRadius: "8px",
}))

const StyledSendButton = styled(RiSendPlaneFill)(({ theme }) => ({
  fill: theme.custom.colors.red,
}))

const StyledStopButton = styled(RiStopFill)(({ theme }) => ({
  fill: theme.custom.colors.red,
}))

const BottomSection = styled.div<{ externalScroll: boolean }>(
  ({ externalScroll, theme }) => ({
    padding: "12px 0 16px",
    ...(externalScroll && {
      position: "sticky",
      bottom: 0,
      background: theme.custom.colors.white,
    }),
    "button:focus-visible": {
      outlineOffset: "-1px",
      borderRadius: "7px",
    },
  }),
)

const Disclaimer = styled(Typography)(({ theme }) => ({
  color: theme.custom.colors.silverGrayDark,
  marginTop: "16px",
  textAlign: "center",
}))

const AiChat: FC<AiChatProps> = ({
  entryScreenTitle,
  entryScreenEnabled = true,
  conversationStarters,
  initialMessages: _initialMessages,
  askTimTitle,
  requestOpts,
  parseContent,
  srLoadingMessages,
  placeholder = "",
  className,
  scrollElement,
  chatId,
  ref,
  ...others // Could contain data attributes
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showEntryScreen, setShowEntryScreen] = useState(entryScreenEnabled)
  const chatScreenRef = useRef<HTMLDivElement>(null)
  const [initialMessages, setInitialMessages] = useState<AiChatMessage[]>()
  const promptInputRef = useRef<HTMLDivElement>(null)

  const {
    messages: unparsed,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
    error,
  } = useAiChat(requestOpts, {
    initialMessages,
    id: chatId,
  })

  useScrollSnap({
    scrollElement: scrollElement || messagesContainerRef.current,
    contentElement: scrollElement ? messagesContainerRef.current : null,
    threshold: 200,
  })

  useEffect(() => {
    if (_initialMessages) {
      const prefix = Math.random().toString().slice(2)
      setInitialMessages(
        _initialMessages.map((m, i) => ({
          ...m,
          id: `initial-${prefix}-${i}`,
        })),
      )
    }
  }, [_initialMessages])

  useEffect(() => {
    if (!showEntryScreen) {
      promptInputRef.current?.querySelector("input")?.focus()
    }
  }, [showEntryScreen])

  const messages = useMemo(() => {
    const initial = initialMessages?.map((m) => m.id)
    return unparsed.map((m) => {
      if (m.role === "assistant" && !initial?.includes(m.id)) {
        const content = parseContent ? parseContent(m.content) : m.content
        return { ...m, content }
      }
      return m
    })
  }, [parseContent, unparsed, initialMessages])

  const showStarters = messages.length === (initialMessages?.length || 0)

  const waiting =
    !showStarters && !error && messages[messages.length - 1]?.role === "user"
  const stoppable = isLoading && messages[messages.length - 1]?.role !== "user"

  const scrollToBottom = () => {
    const element = scrollElement || messagesContainerRef.current
    element?.scrollBy({
      behavior: "instant",
      top: element?.scrollHeight,
    })
  }

  const lastMsg = messages[messages.length - 1]

  const externalScroll = !!scrollElement

  return (
    <Container
      className={className}
      ref={containerRef}
      /**
       * Changing the `useChat` chatId seems to persist some state between
       * hook calls. This can cause strange effects like loading API responses
       * for previous chatId into new chatId.
       *
       * To avoid this, let's change the key, this will force React to make a new component
       * not sharing any of the old state.
       */
      key={chatId}
    >
      {showEntryScreen ? (
        <EntryScreen
          className={classes.entryScreenContainer}
          title={entryScreenTitle}
          conversationStarters={conversationStarters}
          onPromptSubmit={(prompt) => {
            if (prompt.trim() === "") {
              return
            }
            setShowEntryScreen(false)
            append({ role: "user", content: prompt })
          }}
        />
      ) : (
        <ChatScreen
          className={classes.chatScreenContainer}
          data-testid="ai-chat-screen"
          externalScroll={externalScroll}
          ref={chatScreenRef}
        >
          <ChatContainer
            className={classNames(className, classes.root)}
            externalScroll={externalScroll}
            {...others}
          >
            <ChatTitle
              askTimTitle={askTimTitle}
              externalScroll={externalScroll}
              className={classNames(className, classes.title)}
            />
            <MessagesContainer
              className={classes.messagesContainer}
              externalScroll={externalScroll}
              ref={messagesContainerRef}
            >
              {messages.map((m) => (
                <MessageRow
                  key={m.id}
                  data-chat-role={m.role}
                  className={classNames(classes.messageRow, {
                    [classes.messageRowUser]: m.role === "user",
                    [classes.messageRowAssistant]: m.role === "assistant",
                  })}
                >
                  <Message className={classes.message}>
                    <VisuallyHidden as={m.role === "user" ? "h5" : "h6"}>
                      {m.role === "user" ? "You said: " : "Assistant said: "}
                    </VisuallyHidden>
                    <Markdown  remarkPlugins={[remarkMath]} rehypePlugins={[rehypeMathjax]}>{m.content}</Markdown>
                  </Message>
                </MessageRow>
              ))}
              {showStarters ? (
                <StarterContainer>
                  {conversationStarters?.map((m) => (
                    <Starter
                      className={classes.conversationStarter}
                      key={m.content}
                      onClick={() => {
                        scrollToBottom()
                        append({ role: "user", content: m.content })
                      }}
                    >
                      {m.content}
                    </Starter>
                  ))}
                </StarterContainer>
              ) : null}
              {waiting ? (
                <MessageRow
                  className={classNames(
                    classes.messageRow,
                    classes.messageRowAssistant,
                  )}
                  key={"loading"}
                >
                  <Message>
                    <RiMoreFill />
                  </Message>
                </MessageRow>
              ) : null}
              {error ? (
                <Alert severity="error" closable>
                  An unexpected error has occurred.
                </Alert>
              ) : null}
            </MessagesContainer>
            <BottomSection
              externalScroll={externalScroll}
              className={classes.bottomSection}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (isLoading && stoppable) {
                    stop()
                  } else {
                    scrollToBottom()
                    handleSubmit(e)
                  }
                }}
              >
                <Input
                  ref={promptInputRef}
                  fullWidth
                  size="chat"
                  className={classes.input}
                  placeholder={placeholder}
                  name="message"
                  sx={{ flex: 1 }}
                  value={input}
                  onChange={handleInputChange}
                  inputProps={{
                    "aria-label": "Ask a question",
                  }}
                  endAdornment={
                    isLoading ? (
                      <AdornmentButton
                        aria-label="Stop"
                        onClick={stop}
                        disabled={!stoppable}
                      >
                        <StyledStopButton />
                      </AdornmentButton>
                    ) : (
                      <AdornmentButton
                        aria-label="Send"
                        type="submit"
                        onClick={(e) => {
                          if (input.trim() === "") {
                            e.preventDefault()
                            return
                          }
                          scrollToBottom()
                          handleSubmit(e)
                        }}
                      >
                        <StyledSendButton />
                      </AdornmentButton>
                    )
                  }
                />
              </form>
              <Disclaimer variant="body3">
                AI-generated content may be incorrect.
              </Disclaimer>
            </BottomSection>
            <SrAnnouncer
              isLoading={isLoading}
              loadingMessages={srLoadingMessages}
              message={lastMsg?.role === "assistant" ? lastMsg?.content : ""}
            />
          </ChatContainer>
        </ChatScreen>
      )}
    </Container>
  )
}

export { AiChat }
export type { AiChatProps }
