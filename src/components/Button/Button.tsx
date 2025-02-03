import * as React from "react"
import { styled } from "@mui/material/styles"
import { pxToRem } from "../ThemeProvider/typography"
import type { Theme } from "@mui/material/styles"
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
}

const styleProps: Record<string, boolean> = {
  variant: true,
  size: true,
  edge: true,
  startIcon: true,
  endIcon: true,
  responsive: true,
  color: true,
} satisfies Record<keyof ButtonStyleProps, boolean>

const shouldForwardButtonProp = (prop: string) => !styleProps[prop]

const DEFAULT_PROPS: Required<
  Omit<ButtonStyleProps, "startIcon" | "endIcon" | "color">
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

const buttonStyles: any = ({ theme }: { theme: Theme }) => ({
  color: theme.custom.colors.darkGray2,
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
  boxSizing: "border-box",
  borderWidth: BORDER_WIDTHS["medium"],
  padding: "11px 16px",
  borderRadius: "4px",
  ...theme.typography.button,

  variants: [
    {
      props: { size: "large" },
      style: {
        ...theme.typography.buttonLarge,
        padding: "14px 24px",
      },
    },
    {
      props: { size: "large", hasBorder: true },
      style: {
        padding: `${14 - BORDER_WIDTHS["large"]}px 24px`,
      },
    },
    {
      props: ({ size, hasBorder }: { size: ButtonSize; hasBorder: boolean }) =>
        (!size || size === "medium") && hasBorder,
      style: {
        padding: `${11 - BORDER_WIDTHS["medium"]}px 16px`,
      },
    },
    {
      props: { size: "small" },
      style: {
        ...theme.typography.buttonSmall,
        padding: "8px 12px",
      },
    },
    {
      props: { size: "small", hasBorder: true },
      style: {
        padding: `${8 - BORDER_WIDTHS["small"]}px 12px`,
      },
    },
    {
      props: { responsive: true },
      style: {
        [theme.breakpoints.down("sm")]: theme.typography.button,
      },
    },
    {
      props: { size: "large", responsive: true },
      style: {
        [theme.breakpoints.down("sm")]: theme.typography.buttonLarge,
      },
    },
    {
      props: { size: "small", responsive: true },
      style: {
        [theme.breakpoints.down("sm")]: theme.typography.buttonSmall,
      },
    },
    {
      props: { variant: "primary" },
      style: {
        backgroundColor: theme.custom.colors.mitRed,
        color: theme.custom.colors.white,
        border: "none",
        /* Shadow/04dp */
        boxShadow:
          "0px 2px 4px 0px rgba(37, 38, 43, 0.10), 0px 3px 8px 0px rgba(37, 38, 43, 0.12)",
        ":hover:not(:disabled)": {
          backgroundColor: theme.custom.colors.red,
          boxShadow: "none",
        },
        ":disabled": {
          backgroundColor: theme.custom.colors.silverGray,
          boxShadow: "none",
        },
      },
    },
    {
      props: { variant: "success" },
      style: {
        backgroundColor: theme.custom.colors.darkGreen,
        color: theme.custom.colors.white,
        border: "none",
        /* Shadow/04dp */
        boxShadow:
          "0px 2px 4px 0px rgba(37, 38, 43, 0.10), 0px 3px 8px 0px rgba(37, 38, 43, 0.12)",
        ":hover:not(:disabled)": {
          backgroundColor: theme.custom.colors.darkGreen,
          boxShadow: "none",
        },
        ":disabled": {
          backgroundColor: theme.custom.colors.silverGray,
          boxShadow: "none",
        },
      },
    },
    {
      props: { variant: "secondary" },
      style: {
        color: theme.custom.colors.red,
        backgroundColor: "transparent",
        borderColor: "currentcolor",
        borderStyle: "solid",
        ":hover:not(:disabled)": {
          // TODO
          // backgroundColor: tinycolor(theme.custom.colors.brightRed)
          //   .setAlpha(0.06)
          //   .toString(),
        },
        ":disabled": {
          color: theme.custom.colors.silverGray,
        },
      },
    },
    {
      props: { variant: "text" },
      style: {
        backgroundColor: "transparent",
        borderStyle: "none",
        color: theme.custom.colors.darkGray2,
        ":hover:not(:disabled)": {
          // TODO
          // backgroundColor: tinycolor(theme.custom.colors.darkGray1)
          //   .setAlpha(0.06)
          //   .toString(),
        },
        ":disabled": {
          color: theme.custom.colors.silverGray,
        },
      },
    },
    {
      props: { variant: "bordered" },
      style: {
        backgroundColor: theme.custom.colors.white,
        color: theme.custom.colors.silverGrayDark,
        border: `1px solid ${theme.custom.colors.silverGrayLight}`,
        ":hover:not(:disabled)": {
          backgroundColor: theme.custom.colors.lightGray1,
          color: theme.custom.colors.darkGray2,
        },
        ":disabled": {
          backgroundColor: theme.custom.colors.lightGray2,
          border: `1px solid ${theme.custom.colors.lightGray2}`,
          color: theme.custom.colors.silverGrayDark,
        },
      },
    },
    {
      props: { variant: "noBorder" },
      style: {
        backgroundColor: theme.custom.colors.white,
        color: theme.custom.colors.darkGray2,
        border: "none",
        ":hover:not(:disabled)": {
          // TODO
          // backgroundColor: tinycolor(theme.custom.colors.darkGray1)
          //   .setAlpha(0.06)
          //   .toString(),
        },
        ":disabled": {
          color: theme.custom.colors.silverGray,
        },
      },
    },
    {
      props: { variant: "tertiary" },
      style: {
        color: theme.custom.colors.darkGray2,
        border: "none",
        backgroundColor: theme.custom.colors.lightGray2,
        ":hover:not(:disabled)": {
          backgroundColor: theme.custom.colors.white,
        },
        ":disabled": {
          backgroundColor: theme.custom.colors.lightGray2,
          color: theme.custom.colors.silverGrayLight,
        },
      },
    },
    {
      props: { variant: "inverted" },
      style: {
        backgroundColor: theme.custom.colors.white,
        color: theme.custom.colors.mitRed,
        borderColor: theme.custom.colors.mitRed,
        borderStyle: "solid",
      },
    },
    {
      props: { edge: "circular" },
      style: {
        // Pill-shaped buttons... Overlapping border radius get clipped to pill.
        borderRadius: "100vh",
      },
    },
    {
      props: { color: "secondary" },
      style: {
        color: theme.custom.colors.silverGray,
        borderColor: theme.custom.colors.silverGray,
        ":hover:not(:disabled)": {
          backgroundColor: theme.custom.colors.lightGray1,
        },
      },
    },
  ],
})

const ButtonRoot = styled("button", {
  shouldForwardProp: shouldForwardButtonProp,
})<ButtonStyleProps>(buttonStyles)

const ButtonLinkRoot = styled(LinkAdapter, {
  shouldForwardProp: shouldForwardButtonProp,
})<ButtonStyleProps>(buttonStyles)

const IconContainer = styled("span")<{
  side: "start" | "end"
  size: ButtonSize
}>(({ size, side }) => [
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
  {
    "& svg, & .MuiSvgIcon-root": {
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
  },
])

const ButtonInner: React.FC<
  ButtonStyleProps & { children?: React.ReactNode }
> = (props) => {
  const { children, size = DEFAULT_PROPS.size } = props
  return (
    <>
      {props.startIcon ? (
        <IconContainer size={size} side="start">
          {props.startIcon}
        </IconContainer>
      ) : null}
      {children}
      {props.endIcon ? (
        <IconContainer size={size} side="end">
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

export {
  Button,
  ButtonLink,
  ButtonRoot,
  DEFAULT_PROPS,
  ButtonLinkRoot,
  RESPONSIVE_SIZES,
}

export type { ButtonProps, ButtonLinkProps, ButtonStyleProps, ButtonSize }
