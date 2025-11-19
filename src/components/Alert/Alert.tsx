"use client"

import * as React from "react"

import { styled } from "../StyleIsolation/StyleIsolation"
import { default as MuiAlert } from "@mui/material/Alert"
import type { AlertColor } from "@mui/material/Alert"
import { Theme } from "@emotion/react"

const getColor = (theme: Theme, severity: AlertColor) => {
  return {
    info: theme.custom.colors.blue,
    success: theme.custom.colors.green,
    warning: theme.custom.colors.orange,
    error: theme.custom.colors.lightRed,
  }[severity]
}

type AlertStyleProps = {
  severity: AlertColor
}

const AlertStyled = styled(MuiAlert)<AlertStyleProps>(
  ({ theme, severity }) => ({
    padding: "11px 16px",
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: getColor(theme, severity),
    background: "#FFF",
    ".MuiAlert-message": {
      ...theme.typography.body2,
      color: theme.custom.colors.darkGray2,
      alignSelf: "center",
    },
    "> div": {
      paddingTop: 0,
      paddingBottom: 0,
    },
    ".MuiAlert-icon": {
      marginRight: 8,
      svg: {
        width: 16,
        fill: getColor(theme, severity),
      },
    },
    button: {
      padding: 0,
      ":hover": {
        margin: 0,
        background: "none",
      },
    },
  }),
)

const Hidden = styled.span({ display: "none" })

type AlertProps = {
  visible?: boolean
  closable?: boolean
  className?: string
  severity?: AlertColor
  /**
   * Alert Content
   */
  children?: React.ReactNode
}

const Alert: React.FC<AlertProps> = ({
  visible = true,
  severity = "info",
  closable,
  children,
  className,
}) => {
  const [_visible, setVisible] = React.useState(visible)
  const id = React.useId()
  const onCloseClick = () => {
    setVisible(false)
  }

  React.useEffect(() => {
    setVisible(visible)
  }, [visible])

  if (!_visible) {
    return null
  }

  return (
    <AlertStyled
      severity={severity!}
      onClose={closable ? onCloseClick : undefined}
      role="alert"
      aria-describedby={id}
      className={className}
    >
      {children}
      <Hidden id={id}>{severity} message</Hidden>
    </AlertStyled>
  )
}

export { Alert }
export type { AlertProps }
