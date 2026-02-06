"use client"

import * as React from "react"

import styled from "@emotion/styled"
import { default as MuiAlert } from "@mui/material/Alert"
import type {
  AlertProps as MuiAlertProps,
  AlertColor,
} from "@mui/material/Alert"
import { Theme } from "@emotion/react"
import {
  RiInformation2Fill,
  RiCheckboxCircleFill,
  RiAlertFill,
  RiErrorWarningFill,
  RiCloseLine,
} from "@remixicon/react"
import { ActionButton } from "../Button/ActionButton"

const withTransparency = (color: string, opacity: number) => {
  return `color-mix(in srgb, ${color} ${opacity}%, transparent)`
}

const getColor = (theme: Theme, severity: AlertColor) => {
  const colors = {
    info: {
      borderColor: withTransparency(theme.custom.colors.blue, 50),
      backgroundColor: withTransparency(theme.custom.colors.blue, 10),
      iconFill: theme.custom.colors.blue,
    },
    warning: {
      borderColor: withTransparency(theme.custom.colors.orange, 50),
      backgroundColor: withTransparency(theme.custom.colors.orange, 15),
      iconFill: theme.custom.colors.orange,
    },
    error: {
      borderColor: withTransparency(theme.custom.colors.red, 15),
      backgroundColor: withTransparency(theme.custom.colors.brightRed, 10),
      iconFill: theme.custom.colors.red,
    },
    success: {
      borderColor: withTransparency(theme.custom.colors.green, 20),
      backgroundColor: withTransparency(theme.custom.colors.green, 4),
      iconFill: theme.custom.colors.green,
    },
  }
  return colors[severity]
}

type AlertStyleProps = {
  severity: AlertColor
}

const AlertStyled = styled(MuiAlert)<AlertStyleProps>(({ theme, severity }) => {
  const colors = getColor(theme, severity)
  return {
    padding: "11px 16px",
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: "solid",
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
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
      height: 0,
      svg: {
        width: 20,
        height: 20,
        fill: colors.iconFill,
      },
    },
    ".MuiAlert-action": {
      svg: {
        width: 16,
        height: 16,
        stroke: theme.custom.colors.silverGrayDark,
      },
      /**
       * The close button is big enough that it would normally stretch the
       * alert, at least for single-line alerts.
       * We don't want to stretch the alert, but we do want to keep the button
       * large enough to be easily clickable.
       */
      height: "20px",
      display: "flex",
      alignItems: "center",
    },
    boxShadow: "0 4px 8px 0 rgba(19, 20, 21, 0.08)",
  }
})

const ErrorLabel = styled.span(({ theme }) => ({
  ...theme.typography.subtitle2,
  marginRight: "8px",
}))

const ICON_MAPPING: MuiAlertProps["iconMapping"] = {
  info: <RiInformation2Fill />,
  success: <RiCheckboxCircleFill />,
  warning: <RiAlertFill />,
  error: <RiErrorWarningFill />,
}

const Hidden = styled.span({ display: "none" })

type AlertProps = {
  visible?: boolean
  closable?: boolean
  className?: string
  severity?: AlertColor
  onClose?: (event?: React.SyntheticEvent) => void
  /**
   * Alert Content
   */
  children?: React.ReactNode
  /**
   * An optional label to display before the alert content
   */
  label?: React.ReactNode
}

const Alert: React.FC<AlertProps> = ({
  visible = true,
  severity = "info",
  closable,
  children,
  className,
  onClose,
  label,
}) => {
  const [_visible, setVisible] = React.useState(visible)
  const id = React.useId()
  const onCloseClick = (event?: React.SyntheticEvent) => {
    setVisible(false)
    onClose?.(event)
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
      iconMapping={ICON_MAPPING}
      action={
        closable ? (
          <ActionButton
            size="small"
            variant="text"
            aria-label="Dismiss"
            onClick={onCloseClick}
          >
            <RiCloseLine />
          </ActionButton>
        ) : null
      }
    >
      {label ? <ErrorLabel>{label}</ErrorLabel> : null}
      {children}
      <Hidden id={id}>{severity} message</Hidden>
    </AlertStyled>
  )
}

export { Alert }
export type { AlertProps }
