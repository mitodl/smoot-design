import * as React from "react"
import styled from "@emotion/styled"
import Skeleton from "@mui/material/Skeleton"
import { Input } from "../Input/Input"
import { ActionButton } from "../Button/ActionButton"
import { RiSendPlaneFill } from "@remixicon/react"
import { useAiChat } from "./utils"
import Markdown from "react-markdown"

import type { AiChatProps } from "./types"
import { ScrollSnap } from "../ScrollSnap/ScrollSnap"
import classNames from "classnames"
import { SrAnnouncer } from "../SrAnnouncer/SrAnnouncer"
import { ChatTitle } from "./ChatTitle"
// @ts-expect-error TODO make this better
import mascot from "../../../static/images/mit_mascot_tim.png"

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

const ChatContainer = styled.div(({ theme }) => ({
  width: "100%",
  height: "100%",
  border: `1px solid ${theme.custom.colors.silverGrayLight}`,
  backgroundColor: theme.custom.colors.lightGray1,
  display: "flex",
  flexDirection: "column",
}))

const MessagesContainer = styled(ScrollSnap)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: "24px",
  paddingBottom: "0px",
  overflow: "auto",
})
const MessageRow = styled.div<{
  reverse?: boolean
}>({
  margin: "8px 0",
  display: "flex",
  width: "100%",
  gap: "10px",
  [`&.${classes.messageRowUser}`]: {
    flexDirection: "row-reverse",
  },
})
const Avatar = styled.div(({ theme }) => ({
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
  display: "flex",
  flexDirection: "column",
  gap: "4px",
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
  borderRadius: "12px",
}))

const Controls = styled.div(({ theme }) => ({
  display: "flex",
  justifyContent: "space-around",
  padding: "12px 24px",
  backgroundColor: theme.custom.colors.white,
}))
const Form = styled.form(() => ({
  display: "flex",
  width: "80%",
  gap: "12px",
  alignItems: "center",
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

const AiChat: React.FC<AiChatProps> = function AiChat({
  chatId,
  className,
  conversationStarters,
  requestOpts,
  initialMessages: initMsgs,
  parseContent,
  srLoadingMessages,
  title,
  onClose,
}) {
  const [showStarters, setShowStarters] = React.useState(true)
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
    <ChatContainer className={classNames(className, classes.root)}>
      {title ? <ChatTitle title={title} onClose={onClose} /> : null}
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
            <Avatar>
              <img src={mascot} alt="" />
            </Avatar>
            <Message className={classes.message}>
              <Markdown>{m.content}</Markdown>
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
                  setShowStarters(false)
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
            <Avatar className={classes.avatar} />
            <Message>
              <Dots />
            </Message>
          </MessageRow>
        ) : null}
      </MessagesContainer>
      <Controls>
        <Form
          onSubmit={(e) => {
            setShowStarters(false)
            scrollToBottom()
            handleSubmit(e)
          }}
        >
          <Input
            className={classes.input}
            placeholder="Type a message..."
            name="message"
            sx={{ flex: 1 }}
            value={input}
            onChange={handleInputChange}
          />
          <ActionButton
            aria-label="Send"
            type="submit"
            disabled={isLoading || !input}
          >
            <RiSendPlaneFill />
          </ActionButton>
        </Form>
      </Controls>
      <SrAnnouncer
        isLoading={isLoading}
        loadingMessages={srLoadingMessages}
        message={lastMsg.role === "assistant" ? lastMsg.content : ""}
      />
    </ChatContainer>
  )
}

export { AiChat }
export type { AiChatProps }
