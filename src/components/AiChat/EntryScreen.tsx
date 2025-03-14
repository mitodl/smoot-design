import * as React from "react"
import { RiSparkling2Line, RiSendPlaneFill } from "@remixicon/react"
import styled from "@emotion/styled"
import Typography from "@mui/material/Typography"
import { AdornmentButton, Input } from "../Input/Input"
import TimLogo from "./TimLogo"
import { useState } from "react"

const Container = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  padding: "114px 32px 24px",
  [theme.breakpoints.down("md")]: {
    padding: "114px 16px 24px",
    width: "100%",
  },
  boxSizing: "border-box",
  position: "absolute",
  zIndex: 1,
  background: "white",
  bottom: 0,
  top: 0,
  left: 0,
  right: 0,
}))

const TimLogoBox = styled.div(({ theme }) => ({
  position: "relative",
  padding: "16px",
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  borderRadius: "8px",
  "svg:first-child": {
    fill: theme.custom.colors.red,
    position: "absolute",
    top: "-10px",
    left: "-10px",
  },
}))

const StyledTimLogo = styled(TimLogo)({
  width: "40px",
  height: "40px",
  display: "block",
})

const Title = styled(Typography)({
  textAlign: "center",
  padding: "0 40px",
})

const StyledInput = styled(Input)(({ theme }) => ({
  backgroundColor: theme.custom.colors.lightGray1,
  borderRadius: "8px",
  margin: "8px 0 24px 0",
  flexShrink: 0,
}))

const SendIcon = styled(RiSendPlaneFill)(({ theme }) => ({
  fill: theme.custom.colors.red,
  "button:disabled &": {
    fill: theme.custom.colors.silverGray,
  },
}))

const Starters = styled.div(({ theme }) => ({
  display: "flex",
  gap: "16px",
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}))

const Starter = styled.button(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  borderRadius: "8px",
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  padding: "12px 16px",
  color: theme.custom.colors.darkGray2,
  backgroundColor: "transparent",
  textAlign: "left",
  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    padding: "12px 36px",
  },
  ":hover": {
    cursor: "pointer",
    borderColor: "transparent",
    color: theme.custom.colors.white,
    backgroundColor: theme.custom.colors.darkGray1,
  },
}))

type EntryScreenProps = {
  title?: string
  conversationStarters?: { content: string }[]
  onPromptSubmit: (prompt: string) => void
  className?: string
}

const EntryScreen = ({
  title,
  conversationStarters,
  className,
  onPromptSubmit,
}: EntryScreenProps) => {
  const [prompt, setPrompt] = useState("")

  const onPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const onPromptKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && prompt) {
      onPromptSubmit(prompt)
    } else {
      setPrompt(prompt)
    }
  }

  return (
    <Container className={className} data-testid="ai-chat-entry-screen">
      <TimLogoBox>
        <RiSparkling2Line />
        <StyledTimLogo />
      </TimLogoBox>
      {title ? <Title variant="h4">{title}</Title> : null}
      <StyledInput
        fullWidth
        size="chat"
        onChange={onPromptChange}
        onKeyDown={onPromptKeyDown}
        endAdornment={
          <AdornmentButton
            aria-label="Send"
            onClick={() => onPromptSubmit(prompt)}
          >
            <SendIcon />
          </AdornmentButton>
        }
        responsive
      />
      <Starters>
        {conversationStarters?.map(({ content }, index) => (
          <Starter
            key={index}
            onClick={() => onPromptSubmit(content)}
            tabIndex={index}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onPromptSubmit(content)
              }
            }}
          >
            <Typography variant="body2">{content}</Typography>
          </Starter>
        ))}
      </Starters>
    </Container>
  )
}

export { EntryScreen }
