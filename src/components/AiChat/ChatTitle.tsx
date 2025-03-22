import * as React from "react"
import styled from "@emotion/styled"
import Typography from "@mui/material/Typography"
import { RiSparkling2Line } from "@remixicon/react"

const Container = styled.div<{ noScroll?: boolean }>(({ noScroll, theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 0",
  gap: "16px",
  color: theme.custom.colors.white,
  borderRadius: "8px 8px 0 0",
  ...(noScroll && {
    position: "sticky",
    top: 0,
    padding: "32px 0 26px",
    zIndex: 2,
    backgroundColor: theme.custom.colors.white,
    borderRadius: 0,
  }),
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

type ChatTitleProps = {
  askTimTitle?: string
  noScroll?: boolean
  className?: string
}

const ChatTitle = ({ askTimTitle, noScroll, className }: ChatTitleProps) => {
  if (!askTimTitle) return null
  return (
    <Container noScroll={noScroll} className={className}>
      <AskTimTitle>
        <RiSparkling2Line />
        <Typography variant="body1">
          Ask<strong>TIM</strong>&nbsp;
          {askTimTitle}
        </Typography>
      </AskTimTitle>
    </Container>
  )
}

export { ChatTitle }
