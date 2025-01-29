import * as React from "react"
import styled from "@emotion/styled"
import Skeleton from "@mui/material/Skeleton"
import { Input } from "../Input/Input"
import { ActionButton } from "../Button/ActionButton"
import { RiCloseLine, RiRobot2Line, RiSendPlaneFill } from "@remixicon/react"
import { useAiChat } from "./utils"
import Markdown from "react-markdown"

import type { AiChatProps } from "./types"
import { ScrollSnap } from "../ScrollSnap/ScrollSnap"
import classNames from "classnames"
import { SrAnnouncer } from "../SrAnnouncer/SrAnnouncer"

import mascot from "../../../static/images/mit_mascot_tim.png"
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden"
import { ImageAdapter } from "../ImageAdapter/ImageAdapter"
import Typography from "@mui/material/Typography"

const classes = {
  root: "MitAiChat--root",
  conversationStarter: "MitAiChat--conversationStarter",
  messagesContainer: "MitAiChat--messagesContainer",
  messageRow: "MitAiChat--messageRow",
  messageRowUser: "MitAiChat--messageRowUser",
  messageRowAssistant: "MitAiChat--messageRowAssistant",
  message: "MitAiChat--message",
  avatar: "MitAiChat--avatar",
  input: "MitAiChat--input",
}

const ChatContainer = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
})

const MessagesContainer = styled(ScrollSnap)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: "24px",
  paddingBottom: "12px",
  overflow: "auto",
  gap: "24px",
  backgroundColor: theme.custom.colors.lightGray1,
  borderColor: theme.custom.colors.silverGrayLight,
  borderStyle: "solid",
  borderWidth: "0 1px",
}))
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
})
const Avatar = styled.div(({ theme }) => ({
  flexShrink: 0,
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: theme.custom.colors.white,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  img: {
    width: "75%",
    height: "75%",
  },
}))
const Message = styled.div(({ theme }) => ({
  border: `1px solid ${theme.custom.colors.silverGrayLight}`,
  backgroundColor: theme.custom.colors.white,
  padding: "12px",
  ...theme.typography.body2,
  "p:first-of-type": {
    marginTop: 0,
  },
  "p:last-of-type": {
    marginBottom: 0,
  },
  a: {
    color: theme.custom.colors.mitRed,
    textDecoration: "none",
  },
  "a:hover": {
    color: theme.custom.colors.red,
    textDecoration: "underline",
  },
  borderRadius: "12px",
  [`.${classes.messageRowAssistant} &`]: {
    borderRadius: "0 12px 12px 12px",
  },
  [`.${classes.messageRowUser} &`]: {
    borderRadius: "12px 0 12px 12px",
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
  border: `1px solid ${theme.custom.colors.silverGrayLight}`,
  backgroundColor: theme.custom.colors.white,
  padding: "8px 16px",
  ...theme.typography.subtitle3,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.custom.colors.lightGray1,
  },
  borderRadius: "100vh",
}))

const InputStyled = styled(Input)({
  borderRadius: "0 0 8px 8px",
})
const ActionButtonStyled = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.custom.colors.red,
  flexShrink: 0,
  marginRight: "24px",
  marginLeft: "12px",
  "&:hover:not(:disabled)": {
    backgroundColor: theme.custom.colors.mitRed,
  },
}))

const DotsContainer = styled.span(({ theme }) => ({
  display: "inline-flex",
  gap: "4px",
  ".MuiSkeleton-root": {
    backgroundColor: theme.custom.colors.silverGray,
  },
}))
const Dots = () => {
  return (
    <DotsContainer>
      <Skeleton variant="circular" width="8px" height="8px" />
      <Skeleton variant="circular" width="8px" height="8px" />
      <Skeleton variant="circular" width="8px" height="8px" />
    </DotsContainer>
  )
}

const CloseButton = styled(ActionButton)(({ theme }) => ({
  color: "inherit",
  backgroundColor: theme.custom.colors.red,
  "&:hover:not(:disabled)": {
    backgroundColor: theme.custom.colors.mitRed,
  },
}))
const RobotIcon = styled(RiRobot2Line)({
  width: "40px",
  height: "40px",
})

type ChatTitleProps = {
  title?: string
  onClose?: () => void
  className?: string
}
const ChatTitle = styled(({ title, onClose, className }: ChatTitleProps) => {
  return (
    <div className={className}>
      <RobotIcon />
      <Typography flex={1} variant="h5">
        {title}
      </Typography>
      {onClose ? (
        <CloseButton variant="text" onClick={onClose} aria-label="Close chat">
          <RiCloseLine />
        </CloseButton>
      ) : null}
    </div>
  )
})<ChatTitleProps>(({ theme }) => ({
  backgroundColor: theme.custom.colors.red,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 24px",
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
  onClose,
  ImgComponent,
  placeholder = "Type a message...",
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
  } = useAiChat(requestOpts, {
    initialMessages: initialMessages,
    id: chatId,
  })

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
    !showStarters && messages[messages.length - 1]?.role === "user"

  const scrollToBottom = () => {
    messagesRef.current?.scrollBy({
      behavior: "instant",
      top: messagesRef.current.scrollHeight,
    })
  }

  const lastMsg = messages[messages.length - 1]

  return (
    <ChatContainer className={classNames(className, classes.root)} {...others}>
      {<ChatTitle title={title} onClose={onClose} />}
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
            {m.role === "assistant" ? (
              <Avatar className={classes.avatar}>
                <ImageAdapter src={mascot} alt="" Component={ImgComponent} />
              </Avatar>
            ) : null}
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
            <Avatar className={classes.avatar}>
              <ImageAdapter src={mascot} alt="" Component={ImgComponent} />
            </Avatar>
            <Message>
              <Dots />
            </Message>
          </MessageRow>
        ) : null}
      </MessagesContainer>
      <form
        onSubmit={(e) => {
          scrollToBottom()
          handleSubmit(e)
        }}
      >
        <InputStyled
          fullWidth
          size="hero"
          className={classes.input}
          placeholder={placeholder}
          name="message"
          sx={{ flex: 1 }}
          value={input}
          onChange={handleInputChange}
          endAdornment={
            <ActionButtonStyled
              size="large"
              aria-label="Send"
              type="submit"
              disabled={isLoading || !input}
            >
              <RiSendPlaneFill />
            </ActionButtonStyled>
          }
        />
      </form>
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
   * To avoid this, let's chnge the key, this will force React to make a new component
   * not sharing any of the old state.
   */
  <AiChatInternal key={props.chatId} {...props} />
)

export { AiChat }
export type { AiChatProps }
