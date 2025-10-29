import * as React from "react"
import styled from "@emotion/styled"
import type { CSSObject } from "@emotion/react"
import { css } from "@emotion/react"
import { pxToRem } from "../ThemeProvider/typography"
import type { Theme } from "@mui/material/styles"
import CircularProgress from "@mui/material/CircularProgress"
import {
  LinkAdapter,
  LinkAdapterPropsOverrides,
} from "../LinkAdapter/LinkAdapter"

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text" | "bordered"
type ButtonSize = "small" | "medium" | "large"
type ButtonEdge = "circular" | "rounded" | "none"

type ButtonStyleProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  edge?: ButtonEdge
  /**
   * Display an icon before the button text
   */
  startIcon?: React.ReactNode
  /**
   * Display an icon after the button text.
   */
  endIcon?: React.ReactNode
  /**
   * If true (default: `false`), the button will become one size smaller at the
   * `sm` breakpoint.
   *  - large -> medium
   *  - medium -> small
   *  - small -> small
   */
  responsive?: boolean
  color?: "secondary"
  /**
   * Style overrides that will be applied with high specificity.
   * Use this for intentional style customizations.
   */
  sx?: CSSObject
}

const styleProps: Record<string, boolean> = {
  variant: true,
  size: true,
  edge: true,
  startIcon: true,
  endIcon: true,
  responsive: true,
  color: true,
  sx: true,
} satisfies Record<keyof ButtonStyleProps, boolean>

const shouldForwardButtonProp = (prop: string) => !styleProps[prop]

const DEFAULT_PROPS: Required<
  Omit<ButtonStyleProps, "startIcon" | "endIcon" | "color" | "sx">
> = {
  variant: "primary",
  size: "medium",
  edge: "rounded",
  responsive: false,
}

const BORDER_WIDTHS = {
  small: 1,
  medium: 1,
  large: 2,
}

const RESPONSIVE_SIZES: Record<ButtonSize, ButtonSize> = {
  small: "small",
  medium: "small",
  large: "medium",
}

const sizeStyles = (
  size: ButtonSize,
  hasBorder: boolean,
  theme: Theme,
): CSSObject => {
  const paddingAdjust = hasBorder ? BORDER_WIDTHS[size] : 0

  let sizeStyles = {}
  if (size === "large") {
    sizeStyles = {
      padding: `${14 - paddingAdjust}px 24px`,
      ...theme.typography.buttonLarge,
    }
  } else if (size === "medium") {
    sizeStyles = {
      padding: `${11 - paddingAdjust}px 16px`,
      ...theme.typography.button,
    }
  } else if (size === "small") {
    sizeStyles = {
      padding: `${8 - paddingAdjust}px 12px`,
      ...theme.typography.buttonSmall,
    }
  }

  return {
    boxSizing: "border-box",
    borderWidth: BORDER_WIDTHS[size],
    ...sizeStyles,
  }
}

const variantStyles = (
  variant: ButtonVariant,
  colors: Theme["custom"]["colors"],
) => {
  if (variant === "primary") {
    return {
      backgroundColor: colors.mitRed,
      color: colors.white,
      border: "none",
      /* Shadow/04dp */
      boxShadow:
        "0px 2px 4px 0px rgba(37, 38, 43, 0.10), 0px 3px 8px 0px rgba(37, 38, 43, 0.12)",
      ":hover:not(:disabled)": {
        backgroundColor: colors.red,
        boxShadow: "none",
      },
      ":disabled": {
        backgroundColor: colors.silverGray,
        boxShadow: "none",
      },
    }
  } else if (variant === "secondary") {
    return {
      color: colors.red,
      backgroundColor: "transparent",
      borderColor: "currentcolor",
      borderStyle: "solid",
      ":hover:not(:disabled)": {
        // brightRed at 0.06 alpha
        backgroundColor: "rgba(255, 20, 35, 0.06)",
      },
      ":disabled": {
        color: colors.silverGray,
      },
    }
  } else if (variant === "text") {
    return {
      backgroundColor: "transparent",
      borderStyle: "none",
      color: colors.darkGray2,
      ":hover:not(:disabled)": {
        // darkGray1 at 6% alpha
        backgroundColor: "rgba(64, 70, 76, 0.06)",
      },
      ":disabled": {
        color: colors.silverGray,
      },
    }
  } else if (variant === "bordered") {
    return {
      backgroundColor: colors.white,
      color: colors.silverGrayDark,
      border: `1px solid ${colors.silverGrayLight}`,
      ":hover:not(:disabled)": {
        backgroundColor: colors.lightGray1,
        color: colors.darkGray2,
      },
      ":disabled": {
        backgroundColor: colors.lightGray2,
        border: `1px solid ${colors.lightGray2}`,
        color: colors.silverGrayDark,
      },
    }
  } else if (variant === "tertiary") {
    return {
      color: colors.darkGray2,
      border: "none",
      backgroundColor: colors.lightGray2,
      ":hover:not(:disabled)": {
        backgroundColor: colors.white,
      },
      ":disabled": {
        backgroundColor: colors.lightGray2,
        color: colors.silverGrayLight,
      },
    }
  }
  return {}
}

const edgeStyles = (edge: ButtonEdge) => {
  if (edge === "rounded") {
    return {
      borderRadius: "4px",
    }
  } else if (edge === "circular") {
    return {
      // Pill-shaped buttons... Overlapping border radius get clipped to pill.
      borderRadius: "100vh",
    }
  }
  return {}
}

const colorOverrideStyles = (
  color: ButtonStyleProps["color"],
  colors: Theme["custom"]["colors"],
) => {
  if (color === "secondary") {
    return {
      color: colors.silverGray,
      borderColor: colors.silverGray,
      ":hover:not(:disabled)": {
        backgroundColor: colors.lightGray1,
      },
    }
  }
  return {}
}

const buttonStyles = (props: ButtonStyleProps & { theme: Theme }) => {
  const { size, variant, edge, theme, color, responsive, sx } = {
    ...DEFAULT_PROPS,
    ...props,
  }
  const { colors } = theme.custom
  const hasBorder = variant === "secondary" || variant === "bordered"

  const resetStyles: CSSObject = {
    backgroundImage: "none",
    textTransform: "none",
    letterSpacing: "normal",
    textDecoration: "none",
    textShadow: "none",
  }

  const styles = css({
    color: theme.palette.text.primary,
    textAlign: "center",
    // display
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    // transitions
    transition: `background ${theme.transitions.duration.short}ms`,
    // cursor
    cursor: "pointer",
    ":disabled": {
      cursor: "default",
    },
    minWidth: "100px",
    ...sizeStyles(size, hasBorder, theme),
    // responsive
    ...(responsive && {
      [theme.breakpoints.down("sm")]: sizeStyles(
        RESPONSIVE_SIZES[size],
        hasBorder,
        theme,
      ),
    }),
    ...variantStyles(variant, colors),
    ...edgeStyles(edge),
    ...colorOverrideStyles(color, theme.custom.colors),
    ...resetStyles,
    // Apply sx overrides last so they take precedence
    ...sx,
  })

  return css`
    // increase specificity to resist accidental override from parent page styles
    && {
      ${styles}
    }
  `
}

const ButtonRoot = styled("button", {
  shouldForwardProp: shouldForwardButtonProp,
})<ButtonStyleProps>(buttonStyles)
const ButtonLinkRoot = styled(LinkAdapter, {
  shouldForwardProp: shouldForwardButtonProp,
})<ButtonStyleProps>(buttonStyles)

const iconSizeStyles = (size: ButtonSize) => ({
  "& > *": {
    width: "1em",
    height: "1em",
    fontSize: pxToRem(
      {
        small: 16,
        medium: 20,
        large: 24,
      }[size],
    ),
  },
})
const IconContainer = styled.span<{
  side: "start" | "end"
  size: ButtonSize
  responsive?: boolean
}>(({ theme, responsive, side, size }) => {
  return [
    {
      height: "1em",
      display: "flex",
      alignItems: "center",
    },
    side === "start" && {
      /**
       * The negative margin is to counteract the padding on the button itself.
       * Without icons, the left space is 24/16/12 px.
       * With icons, the left space is 20/12/8 px.
       */
      marginLeft: "-4px",
      marginRight: "8px",
    },
    side === "end" && {
      marginLeft: "8px",
      marginRight: "-4px",
    },
    iconSizeStyles(size),
    responsive && {
      [theme.breakpoints.down("sm")]: iconSizeStyles(RESPONSIVE_SIZES[size]),
    },
  ]
})

const ButtonInner: React.FC<
  ButtonStyleProps & { children?: React.ReactNode }
> = (props) => {
  const { children, size = DEFAULT_PROPS.size, responsive } = props
  return (
    <>
      {props.startIcon ? (
        <IconContainer responsive={responsive} size={size} side="start">
          {props.startIcon}
        </IconContainer>
      ) : null}
      {children}
      {props.endIcon ? (
        <IconContainer responsive={responsive} size={size} side="end">
          {props.endIcon}
        </IconContainer>
      ) : null}
    </>
  )
}

type ButtonProps = ButtonStyleProps & React.ComponentProps<"button">

/**
 * Our standard button component. See [Button Docs](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-button--docs).
 *
 * See also:
 * - [ButtonLink](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-button--docs#links)
 * - [ActionButton](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-actionbutton--docs) for icon-only uses
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <ButtonRoot ref={ref} type="button" {...props}>
        <ButtonInner {...props}>{children}</ButtonInner>
      </ButtonRoot>
    )
  },
)
Button.displayName = "Button"

type ButtonLinkProps = ButtonStyleProps &
  React.ComponentProps<"a"> & {
    Component?: React.ElementType
  } & LinkAdapterPropsOverrides

/**
 * See [ButtonLink docs](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-button--docs#links)
 */
const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ children, Component, ...props }: ButtonLinkProps, ref) => {
    return (
      <ButtonLinkRoot Component={Component} ref={ref} {...props}>
        <ButtonInner {...props}>{children}</ButtonInner>
      </ButtonLinkRoot>
    )
  },
)

ButtonLink.displayName = "ButtonLink"

/**
 * A loading spinner sized for our buttons; use it as the `startIcon` or `endIcon` prop.
 */
const ButtonLoadingIcon: React.FC = () => {
  return (
    <CircularProgress
      color="inherit"
      size="1em"
      /**
       * MUI's spinner's viewbox is 44x44, so when we resize this, it ends up being
       * 5.5 * (24/44) = 3.0px
       * 5.5 * (20/44) = 2.5px
       * 5.5 * (16/44) = 2.0px
       */
      thickness={5.5}
    />
  )
}

export {
  Button,
  ButtonLink,
  ButtonRoot,
  DEFAULT_PROPS,
  ButtonLinkRoot,
  RESPONSIVE_SIZES,
  ButtonLoadingIcon,
}

export type { ButtonProps, ButtonLinkProps, ButtonStyleProps, ButtonSize }
