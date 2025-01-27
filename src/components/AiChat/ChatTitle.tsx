import * as React from "react"
import styled from "@emotion/styled"
import { RiCloseLine, RiRobot2Line } from "@remixicon/react"
import Typography from "@mui/material/Typography"
import { ActionButton } from "../Button/ActionButton"

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
  title: string
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
}))

export { ChatTitle }
