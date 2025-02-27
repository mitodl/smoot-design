import * as React from "react"
import styled from "@emotion/styled"
import { Input, AdornmentButton } from "../Input/Input"
import { ActionButton } from "../Button/ActionButton"
import {
  RiCloseLine,
  RiRobot2Line,
  RiSendPlaneFill,
  RiStopFill,
  RiSparkling2Line,
  RiMoreFill,
} from "@remixicon/react"
import { useAiChat } from "./utils"
import Markdown from "react-markdown"
import type { AiChatProps } from "./types"
import { ScrollSnap } from "../ScrollSnap/ScrollSnap"
import classNames from "classnames"
import { SrAnnouncer } from "../SrAnnouncer/SrAnnouncer"
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden"
import Typography from "@mui/material/Typography"
import { Alert } from "../Alert/Alert"

const classes = {
  root: "MitAiChat--root",
  title: "MitAiChat--title",
  conversationStarter: "MitAiChat--conversationStarter",
  messagesContainer: "MitAiChat--messagesContainer",
  messageRow: "MitAiChat--messageRow",
  messageRowUser: "MitAiChat--messageRowUser",
  messageRowAssistant: "MitAiChat--messageRowAssistant",
  message: "MitAiChat--message",
  input: "MitAiChat--input",
  bottomSection: "MitAiChat--bottomSection",
}

const ChatContainer = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
})

const CloseButton = styled(ActionButton)(({ theme }) => ({
  "&&:hover": {
    backgroundColor: theme.custom.colors.red,
    color: theme.custom.colors.white,
  },
}))

const AskTimTitle = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: theme.custom.colors.darkGray2,
  img: {
    width: "24px",
    height: "24px",
  },
  svg: {
    fill: theme.custom.colors.red,
    width: "24px",
    height: "24px",
  },
}))

const MessagesContainer = styled(ScrollSnap)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: "14px 0",
  overflow: "auto",
  gap: "16px",
})

const MessageRow = styled.div<{
  reverse?: boolean
}>({
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
    border: `1px solid ${theme.custom.colors.lightGray2}`,
    borderRadius: "0px 8px 8px 8px",
    svg: {
      fill: theme.custom.colors.silverGrayDark,
      display: "block",
    },
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

const RobotIcon = styled(RiRobot2Line)({
  width: "40px",
  height: "40px",
})

const StyledSendButton = styled(RiSendPlaneFill)(({ theme }) => ({
  fill: theme.custom.colors.red,
}))

const StyledStopButton = styled(RiStopFill)(({ theme }) => ({
  fill: theme.custom.colors.red,
}))

const BottomSection = styled.div({
  paddingTop: "12px",
})

const Disclaimer = styled(Typography)(({ theme }) => ({
  color: theme.custom.colors.silverGrayDark,
  marginTop: "14px",
  textAlign: "center",
}))

type ChatTitleProps = {
  title?: string
  askTimTitle?: string
  onClose?: () => void
  className?: string
}

const ChatTitle = styled(
  ({ title, askTimTitle, onClose, className }: ChatTitleProps) => {
    return (
      <div className={className}>
        {askTimTitle ? (
          <AskTimTitle>
            <RiSparkling2Line />
            <Typography variant="body1">
              Ask<strong>TIM</strong>&nbsp;
              {askTimTitle}
            </Typography>
          </AskTimTitle>
        ) : null}
        {title ? (
          <>
            <RobotIcon />
            <Typography flex={1} variant="h5">
              {title}
            </Typography>
          </>
        ) : null}
        {onClose ? (
          <CloseButton
            variant="tertiary"
            edge="rounded"
            onClick={onClose}
            aria-label="Close chat"
          >
            <RiCloseLine />
          </CloseButton>
        ) : null}
      </div>
    )
  },
)<ChatTitleProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 0",
  gap: "16px",
  color: theme.custom.colors.white,
  borderRadius: "8px 8px 0 0",
}))

const AiChatInternal: React.FC<AiChatProps> = function AiChat({
  chatId,
  className,
  conversationStarters,
  requestOpts,
  initialMessages: initMsgs,
  parseContent,
  srLoadingMessages,
  title,
  askTimTitle,
  onClose,
  ImgComponent,
  placeholder = "",
  ref,
  ...others // Could contain data attributes
}) {
  const messagesRef = React.useRef<HTMLDivElement>(null)
  const initialMessages = React.useMemo(() => {
    const prefix = Math.random().toString().slice(2)
    return initMsgs.map((m, i) => ({ ...m, id: `initial-${prefix}-${i}` }))
  }, [initMsgs])

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
    initialMessages: initialMessages,
    id: chatId,
  })

  React.useImperativeHandle(ref, () => ({ append }), [append])

  const messages = React.useMemo(() => {
    const initial = initialMessages.map((m) => m.id)
    return unparsed.map((m) => {
      if (m.role === "assistant" && !initial.includes(m.id)) {
        const content = parseContent ? parseContent(m.content) : m.content
        return { ...m, content }
      }
      return m
    })
  }, [parseContent, unparsed, initialMessages])

  const showStarters = messages.length === initialMessages.length

  const waiting =
    !showStarters && !error && messages[messages.length - 1]?.role === "user"
  const stoppable = isLoading && messages[messages.length - 1]?.role !== "user"

  const scrollToBottom = () => {
    messagesRef.current?.scrollBy({
      behavior: "instant",
      top: messagesRef.current.scrollHeight,
    })
  }

  const lastMsg = messages[messages.length - 1]

  return (
    <ChatContainer className={classNames(className, classes.root)} {...others}>
      <ChatTitle
        title={title}
        askTimTitle={askTimTitle}
        onClose={onClose}
        className={classNames(className, classes.title)}
      />
      <MessagesContainer
        className={classes.messagesContainer}
        ref={messagesRef}
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
              <VisuallyHidden>
                {m.role === "user" ? "You said: " : "Assistant said: "}
              </VisuallyHidden>
              <Markdown skipHtml>{m.content}</Markdown>
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
      <BottomSection className={classes.bottomSection}>
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
            fullWidth
            size="chat"
            className={classes.input}
            placeholder={placeholder}
            name="message"
            sx={{ flex: 1 }}
            value={input}
            onChange={handleInputChange}
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
        message={lastMsg.role === "assistant" ? lastMsg.content : ""}
      />
    </ChatContainer>
  )
}

const AiChat: React.FC<AiChatProps> = (props) => (
  /**
   * Changing the `useChat` chatId seems to persist some state between
   * hook calls. This can cause strange effects like loading API responses
   * for previous chatId into new chatId.
   *
   * To avoid this, let's change the key, this will force React to make a new component
   * not sharing any of the old state.
   */
  <AiChatInternal key={props.chatId} {...props} />
)

export { AiChat }
export type { AiChatProps }
