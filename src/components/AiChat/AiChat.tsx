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
}>(({ reverse }) => [
  {
    margin: "8px 0",
    display: "flex",
    width: "100%",
    flexDirection: reverse ? "row-reverse" : "row",
  },
])
const Avatar = styled.div({})
const Message = styled.div(({ theme }) => ({
  border: `1px solid ${theme.custom.colors.silverGrayLight}`,
  backgroundColor: theme.custom.colors.white,
  borderRadius: "24px",
  padding: "4px 16px",
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
  borderRadius: "24px",
  padding: "4px 16px",
  ...theme.typography.body2,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.custom.colors.lightGray1,
  },
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
  className,
  conversationStarters,
  requestOpts,
  initialMessages: initMsgs,
  parseContent,
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

  return (
    <ChatContainer className={className}>
      <MessagesContainer ref={messagesRef}>
        {messages.map((m) => (
          <MessageRow key={m.id} reverse={m.role === "user"}>
            <Avatar />
            <Message>
              <Markdown>{m.content}</Markdown>
            </Message>
          </MessageRow>
        ))}
        {showStarters ? (
          <StarterContainer>
            {conversationStarters?.map((m) => (
              <Starter
                key={m.content}
                onClick={() => {
                  setShowStarters(false)
                  append({ role: "user", content: m.content })
                }}
              >
                {m.content}
              </Starter>
            ))}
          </StarterContainer>
        ) : null}
        {waiting ? (
          <MessageRow key={"loading"}>
            <Avatar />
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
            handleSubmit(e)
          }}
        >
          <Input
            name="message"
            sx={{ flex: 1 }}
            value={input}
            onChange={handleInputChange}
          />
          <ActionButton type="submit" disabled={isLoading || !input}>
            <RiSendPlaneFill />
          </ActionButton>
        </Form>
      </Controls>
    </ChatContainer>
  )
}

export { AiChat }
