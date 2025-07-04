import * as React from "react"
import { useEffect, useRef, useState } from "react"
import type { FC } from "react"
import styled from "@emotion/styled"
import Typography from "@mui/material/Typography"
import classNames from "classnames"
import { RiSendPlaneFill, RiStopFill } from "@remixicon/react"
import { Input, AdornmentButton } from "../Input/Input"
import type { AiChatDisplayProps, AiChatProps } from "./types"
import { EntryScreen } from "./EntryScreen"
import { ScrollSnap } from "../ScrollSnap/ScrollSnap"
import { SrAnnouncer } from "../SrAnnouncer/SrAnnouncer"
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden"
import { Alert } from "../Alert/Alert"
import { ChatTitle } from "./ChatTitle"
import { AiChatProvider, useAiChat } from "./AiChatContext"
import { useScrollSnap } from "../ScrollSnap/useScrollSnap"
import type { Message } from "@ai-sdk/react"
import Markdown from "./Markdown"
import EllipsisIcon from "./EllipsisIcon"

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
    [`> .${classes.messageRowAssistant}:first-child`]: {
      marginTop: "16px",
    },
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
  ...theme.typography.body2,
  "p:first-of-type": {
    marginTop: 0,
  },
  "p:last-of-type": {
    marginBottom: 0,
  },
  "ol,ul": {
    paddingInlineStart: "16px",
    margin: "12px 0 12px 4px",
  },
  "ol > li, ul > li": {
    margin: "12px 0",
    "ol,ul": {
      margin: "12px 0 12px 4px",
    },
    li: {
      margin: "6px 0",
    },
  },
  ul: {
    paddingInlineStart: 0,
    "> li": {
      listStyleType: "none",
      position: "relative",
      "&::before": {
        content: '"–"',
        position: "absolute",
        left: 0,
        color: "#888",
        marginRight: "8px",
      },
      paddingLeft: "16px",
    },
  },
  "ol + ul": {
    marginLeft: "24px",
    li: {
      margin: "6px 0",
    },
  },
  a: {
    color: theme.custom.colors.red,
    fontWeight: "normal",
  },
  borderRadius: "12px",
  [`.${classes.messageRowUser} &`]: {
    padding: "12px 16px",
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

const StyledEllipsisIcon = styled(EllipsisIcon)(({ theme }) => ({
  ellipse: {
    fill: theme.custom.colors.darkGray2,
  },
  width: "24px",
  height: "24px",
}))

const AiChatDisplay: FC<AiChatDisplayProps> = ({
  conversationStarters,
  askTimTitle,
  entryScreenEnabled = true,
  entryScreenTitle,
  srLoadingMessages,
  placeholder = "",
  className,
  scrollElement,
  ref,
  useMathJax = false,
  onSubmit,
  ...others // Could contain data attributes
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatScreenRef = useRef<HTMLDivElement>(null)
  const promptInputRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
    error,
    initialMessages,
    status,
  } = useAiChat()

  useScrollSnap({
    scrollElement: scrollElement || messagesContainerRef.current,
    contentElement: scrollElement ? messagesContainerRef.current : null,
    threshold: 200,
  })

  const [showEntryScreen, setShowEntryScreen] = useState(entryScreenEnabled)
  useEffect(() => {
    if (!showEntryScreen) {
      promptInputRef.current?.querySelector("input")?.focus()
    }
  }, [showEntryScreen])

  useEffect(() => {
    if (
      messages.some(
        (m) => m.role === "user" || ["submitted", "streaming"].includes(status),
      )
    ) {
      setShowEntryScreen(false)
    }
  }, [messages, status])

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
    <Container className={className} ref={containerRef}>
      {showEntryScreen ? (
        <EntryScreen
          className={classes.entryScreenContainer}
          title={entryScreenTitle}
          conversationStarters={conversationStarters}
          onPromptSubmit={(prompt, meta) => {
            if (prompt.trim() === "") {
              return
            }
            setShowEntryScreen(false)
            append({ role: "user", content: prompt })
            onSubmit?.(prompt, meta)
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
              {messages.map((m: Message, i) => {
                // Our Markdown+Mathjax has issues when rendering streaming display math
                // Force a re-render of the last (streaming) message when it's done loading.
                const key =
                  i === messages.length - 1 && isLoading
                    ? `isLoading-${m.id}`
                    : m.id
                return (
                  <MessageRow
                    key={key}
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
                      {useMathJax ? (
                        <Markdown enableMathjax={true}>
                          {replaceMathjax(m.content)}
                        </Markdown>
                      ) : (
                        <Markdown>{m.content}</Markdown>
                      )}
                    </Message>
                  </MessageRow>
                )
              })}
              {showStarters ? (
                <StarterContainer>
                  {conversationStarters?.map((m) => (
                    <Starter
                      className={classes.conversationStarter}
                      key={m.content}
                      onClick={() => {
                        scrollToBottom()
                        append({ role: "user", content: m.content })
                        onSubmit?.(m.content, {
                          source: "conversation-starter",
                        })
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
                    <StyledEllipsisIcon />
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
                  }
                  scrollToBottom()
                  handleSubmit(e)
                  onSubmit?.(input, { source: "input" })
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
                        type="submit"
                        disabled={!stoppable}
                      >
                        <StyledStopButton />
                      </AdornmentButton>
                    ) : (
                      <AdornmentButton type="submit" aria-label="Send">
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

const AiChat: FC<AiChatProps> = ({
  requestOpts,
  initialMessages,
  chatId,
  parseContent,
  ...displayProps
}) => {
  return (
    <AiChatProvider
      requestOpts={requestOpts}
      chatId={chatId}
      initialMessages={initialMessages}
      parseContent={parseContent}
    >
      <AiChatDisplay {...displayProps} />
    </AiChatProvider>
  )
}

// react-markdown expects Mathjax delimiters to be $...$ or $$...$$
// the prompt for the tutorbot asks for Mathjax tags with $ format but
// the LLM does not get it right all the time
// this function replaces the Mathjax tags with the correct format
// eventually we will probably be able to remove this as LLMs get better
function replaceMathjax(inputString: string): string {
  // Replace instances of \(...\) and \[...\] Mathjax tags with $...$
  // and $$...$$ tags.
  const INLINE_MATH_REGEX = /\\\((.*?)\\\)/g
  const DISPLAY_MATH_REGEX = /\\\[(([\s\S]*?))\\\]/g
  inputString = inputString.replace(
    INLINE_MATH_REGEX,
    (_match, p1) => `$${p1}$`,
  )
  return inputString.replace(DISPLAY_MATH_REGEX, (_match, p1) => `$$${p1}$$`)
}

export { AiChatDisplay, AiChat, replaceMathjax }
