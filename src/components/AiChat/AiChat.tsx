import * as React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import type { FC } from "react"
import styled from "@emotion/styled"
import Typography from "@mui/material/Typography"
import classNames from "classnames"
import {
  RiSendPlaneFill,
  RiStopFill,
  RiThumbUpLine,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbDownFill,
} from "@remixicon/react"
import { Input, AdornmentButton } from "../Input/Input"
import type { AiChatDisplayProps, AiChatMessage, AiChatProps } from "./types"
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
import { SimpleSelectField } from "../SimpleSelect/SimpleSelect"
import { useFetch } from "./utils"
import { SelectChangeEvent } from "@mui/material/Select"
import type { MathJax3Config } from "better-react-mathjax"
import { MathJaxContext } from "better-react-mathjax"
import deepmerge from "@mui/utils/deepmerge"
import { ActionButton } from "../Button/ActionButton"
import { Tooltip } from "../Tooltip/Tooltip"

const ConditionalMathJaxWrapper: React.FC<{
  useMathJax: boolean
  config?: MathJax3Config
  children: React.ReactNode
}> = ({ useMathJax, config = {}, children }) => {
  if (!useMathJax) {
    return <>{children}</>
  }

  return (
    <MathJaxContext
      config={deepmerge(
        {
          startup: {
            typeset: false,
          },
          loader: { load: ["[tex]/boldsymbol"] },
          tex: {
            packages: { "[+]": ["boldsymbol"] },
          },
        },
        config,
      )}
    >
      {children}
    </MathJaxContext>
  )
}

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

const AssignmentSelect = styled(SimpleSelectField)({
  width: "295px",
  "> div": {
    width: "inherit",
  },
  label: {
    display: "none",
  },
})

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
  "a:has(sup)": {
    textDecoration: "none",
    fontSize: "0.83em",
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

const FeedbackRowContainer = styled.div({
  display: "flex",
  gap: "4px",
  margin: "16px 0 10px 0",
})

const FeedbackButton = styled(ActionButton)(({ theme }) => ({
  borderRadius: "8px",
  ":hover:not(:disabled)": {
    backgroundColor: theme.custom.colors.lightGray2,
  },
  svg: {
    fill: theme.custom.colors.darkGray1,
  },
}))

const FeedbackButtons: FC<{ message: AiChatMessage }> = ({ message }) => {
  const { submitFeedback } = useAiChat()
  const [feedback, setFeedback] = useState<"like" | "dislike" | "">("")

  const onFeedback = useCallback(
    (newFeedback: "like" | "dislike") => () => {
      if (feedback === newFeedback) {
        setFeedback("")
        submitFeedback?.(message.id, "")
      } else {
        setFeedback(newFeedback)
        submitFeedback?.(message.id, newFeedback)
      }
    },
    [message.id, feedback, submitFeedback],
  )

  if (!message.data?.checkpoint_pk || !message.data?.thread_id) {
    return null
  }

  return (
    <FeedbackRowContainer>
      <Tooltip title="Good response">
        <FeedbackButton
          variant="text"
          size="small"
          onClick={onFeedback("like")}
          aria-label="Good response"
          aria-pressed={feedback === "like"}
        >
          {feedback === "like" ? <RiThumbUpFill /> : <RiThumbUpLine />}
        </FeedbackButton>
      </Tooltip>
      <Tooltip title="Bad response">
        <FeedbackButton
          variant="text"
          size="small"
          onClick={onFeedback("dislike")}
          aria-label="Bad response"
          aria-pressed={feedback === "dislike"}
        >
          {feedback === "dislike" ? <RiThumbDownFill /> : <RiThumbDownLine />}
        </FeedbackButton>
      </Tooltip>
    </FeedbackRowContainer>
  )
}

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
  mathJaxConfig,
  onSubmit,
  problemSetListUrl,
  problemSetInitialMessages,
  problemSetEmptyMessages,
  ...others // Could contain data attributes
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatScreenRef = useRef<HTMLDivElement>(null)
  const promptInputRef = useRef<HTMLDivElement>(null)
  const { response: problemSetListResponse } = useFetch<{
    problem_set_titles: string[]
  }>(problemSetListUrl)
  const [needsProblemSet, setNeedsProblemSet] = useState(!!problemSetListUrl)

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
    additionalBody,
    setMessages,
    setAdditionalBody,
  } = useAiChat()

  const [messagesContainerElement, setMessagesContainerElement] =
    useState<HTMLDivElement | null>(null)

  useEffect(() => {
    setMessagesContainerElement(messagesContainerRef.current)
  }, [])

  useScrollSnap({
    scrollElement: scrollElement || messagesContainerElement,
    contentElement: scrollElement ? messagesContainerElement : null,
    threshold: 200,
  })

  const showEntryScreen =
    entryScreenEnabled &&
    !messages.some(
      (m) => m.role === "user" || ["submitted", "streaming"].includes(status),
    )

  useEffect(() => {
    if (!showEntryScreen) {
      promptInputRef.current
        ?.querySelector("input")
        ?.focus({ preventScroll: true })
    }
  }, [showEntryScreen])

  useEffect(() => {
    if (
      problemSetListResponse &&
      !problemSetListResponse.problem_set_titles?.length
    ) {
      if (problemSetEmptyMessages) {
        setMessages(
          problemSetEmptyMessages.map((message, i) => ({
            id: `initial-${i}`,
            ...message,
          })),
        )
      } else {
        setMessages([
          {
            id: "initial-0",
            role: "assistant",
            content:
              "Hi! It looks like there are no assignments available right now. I'm here to help when there is an assignment ready to start.",
          },
        ])
      }
    }
  }, [problemSetListResponse, problemSetEmptyMessages, setMessages])

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

  const onProblemSetChange = (event: SelectChangeEvent<string | string[]>) => {
    if (problemSetInitialMessages) {
      setMessages(
        problemSetInitialMessages.map((message, i) => ({
          content: message.content?.replace(
            "<title>",
            event.target.value as string,
          ),
          role: message.role,
          id: `initial-${i}`,
        })),
      )
    }
    setNeedsProblemSet(!event.target.value)
    setAdditionalBody?.({ problem_set_title: event.target.value as string })
  }

  const lastMsg = messages[messages.length - 1]

  const externalScroll = !!scrollElement

  return (
    <Container className={className}>
      {showEntryScreen ? (
        <EntryScreen
          className={classes.entryScreenContainer}
          title={entryScreenTitle}
          conversationStarters={conversationStarters}
          onPromptSubmit={(prompt, meta) => {
            if (prompt.trim() === "") {
              return
            }
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
              control={
                problemSetListResponse?.problem_set_titles?.length ? (
                  <AssignmentSelect
                    label="Assignments"
                    options={[
                      {
                        value: "",
                        label: "Select an assignment",
                        disabled: true,
                      },
                      ...problemSetListResponse.problem_set_titles.map(
                        (title) => ({
                          value: title,
                          label: title,
                        }),
                      ),
                    ]}
                    value={additionalBody?.problem_set_title ?? ""}
                    onChange={onProblemSetChange}
                  />
                ) : null
              }
            />
            <ConditionalMathJaxWrapper
              useMathJax={useMathJax}
              config={mathJaxConfig}
            >
              <MessagesContainer
                className={classes.messagesContainer}
                externalScroll={externalScroll}
                ref={messagesContainerRef}
              >
                {messages.map((message: Message, index: number) => {
                  return (
                    <MessageRow
                      key={index}
                      data-chat-role={message.role}
                      className={classNames(classes.messageRow, {
                        [classes.messageRowUser]: message.role === "user",
                        [classes.messageRowAssistant]:
                          message.role === "assistant",
                      })}
                    >
                      <Message className={classes.message}>
                        <VisuallyHidden
                          as={message.role === "user" ? "h5" : "h6"}
                        >
                          {message.role === "user"
                            ? "You said: "
                            : "Assistant said: "}
                        </VisuallyHidden>
                        <Markdown useMathJax={useMathJax}>
                          {message.content}
                        </Markdown>
                        <FeedbackButtons message={message as AiChatMessage} />
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
            </ConditionalMathJaxWrapper>
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
                  multiline
                  maxRows={20}
                  size="chat"
                  className={classes.input}
                  placeholder={placeholder}
                  name="message"
                  sx={{ flex: 1 }}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      if (input.trim() && !isLoading) {
                        const form = event.currentTarget.closest("form")
                        form?.requestSubmit()
                      }
                    }
                  }}
                  inputProps={{
                    "aria-label": "Ask a question",
                  }}
                  disabled={needsProblemSet}
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
                      <AdornmentButton
                        type="submit"
                        aria-label="Send"
                        disabled={needsProblemSet}
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

export { AiChatDisplay, AiChat }
