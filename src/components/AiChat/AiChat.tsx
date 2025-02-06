import * as React from "react"
import styled from "@emotion/styled"
import { Input, AdornmentButton } from "../Input/Input"
import { ActionButton } from "../Button/ActionButton"
import { RiCloseLine, RiRobot2Line, RiSendPlaneFill } from "@remixicon/react"
import { useAiChat } from "./utils"
import Markdown from "react-markdown"
import type { AiChatProps } from "./types"
import { ScrollSnap } from "../ScrollSnap/ScrollSnap"
import classNames from "classnames"
import { SrAnnouncer } from "../SrAnnouncer/SrAnnouncer"
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden"
import { ImageAdapter } from "../ImageAdapter/ImageAdapter"
import Typography from "@mui/material/Typography"
import askTimIcon from "../../../static/images/ask-tim.svg"
import waitingDotsIcon from "../../../static/images/waiting-dots-icon.svg"

const classes = {
  root: "MitAiChat--root",
  title: "MitAiChat--title",
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

const AskTimTitle = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: theme.custom.colors.darkGray2,
  img: {
    width: "24px",
    height: "24px",
  },
}))

const MessagesContainer = styled(ScrollSnap)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  paddingBottom: "24px",
  overflow: "auto",
  gap: "24px",
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
  backgroundColor: theme.custom.colors.white,
  padding: "12px 16px",
  ...theme.typography.body2,
  "p:first-of-type": {
    marginTop: 0,
  },
  "p:last-of-type": {
    marginBottom: 0,
  },
  a: {
    color: theme.custom.colors.red,
    fontWeight: "normal",
  },
  borderRadius: "12px",
  [`.${classes.messageRowAssistant} &`]: {
    border: `1px solid ${theme.custom.colors.lightGray2}`,
    color: theme.custom.colors.darkGray2,
    borderRadius: "0px 8px 8px 8px",
  },
  [`.${classes.messageRowUser} &`]: {
    borderRadius: "8px 0px 8px 8px",
    color: theme.custom.colors.white,
    backgroundColor: theme.custom.colors.darkGray1,
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
    backgroundColor: theme.custom.colors.darkGray1,
    borderColor: "transparent",
  },
  borderRadius: "8px",
}))

const Dots = styled(ImageAdapter)({
  width: "24px",
  height: "24px",
  display: "block",
})

const RobotIcon = styled(RiRobot2Line)({
  width: "40px",
  height: "40px",
})

const StyledInput = styled(Input)(({ theme }) => ({
  backgroundColor: theme.custom.colors.lightGray1,
  borderRadius: "8px",
  border: `1px solid ${theme.custom.colors.lightGray2}`,
}))

const StyledSendButton = styled(RiSendPlaneFill)(({ theme }) => ({
  fill: theme.custom.colors.red,
}))

type ChatTitleProps = {
  title?: string
  askTimToText?: string
  onClose?: () => void
  className?: string
}

const ChatTitle = styled(
  ({ title, askTimToText, onClose, className }: ChatTitleProps) => {
    return (
      <div className={className}>
        {askTimToText ? (
          <AskTimTitle>
            <ImageAdapter src={askTimIcon} alt="" />
            <Typography variant="body1">
              Ask<strong>TIM</strong>&nbsp;
              {askTimToText}
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
          <ActionButton
            variant="text"
            edge="none"
            onClick={onClose}
            aria-label="Close chat"
          >
            <RiCloseLine />
          </ActionButton>
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
  askTimToText,
  onClose,
  ImgComponent,
  placeholder = "",
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
      <ChatTitle
        title={title}
        askTimToText={askTimToText}
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
              <Dots src={waitingDotsIcon} alt="" />
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
        <StyledInput
          fullWidth
          size="chat"
          className={classes.input}
          placeholder={placeholder}
          name="message"
          sx={{ flex: 1 }}
          value={input}
          onChange={handleInputChange}
          endAdornment={
            <AdornmentButton
              aria-label="Send"
              type="submit"
              disabled={isLoading || !input}
              onClick={(e) => {
                scrollToBottom()
                handleSubmit(e)
              }}
            >
              <StyledSendButton />
            </AdornmentButton>
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
   * To avoid this, let's change the key, this will force React to make a new component
   * not sharing any of the old state.
   */
  <AiChatInternal key={props.chatId} {...props} />
)

export { AiChat }
export type { AiChatProps }
