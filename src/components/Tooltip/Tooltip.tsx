import * as React from "react"
import styled from "@emotion/styled"
import { default as MuiTooltip } from "@mui/material/Tooltip"
import type { TooltipProps } from "@mui/material/Tooltip"

const StyledTooltip = styled.div(({ theme }) => ({
  backgroundColor: theme.custom.colors.darkGray1,
  padding: "4px 12px",
  borderRadius: "12px",
  marginTop: "4px",
  ...theme.typography.body3,
  color: theme.custom.colors.white,
}))

const Tooltip = ({ title, children, ...props }: TooltipProps) => {
  return (
    <MuiTooltip
      title={title}
      slots={{
        tooltip: StyledTooltip,
      }}
      {...props}
    >
      {children}
    </MuiTooltip>
  )
}

export { Tooltip }
export type { TooltipProps }
