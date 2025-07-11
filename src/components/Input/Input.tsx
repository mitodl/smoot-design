import * as React from "react"
import styled from "@emotion/styled"
import { css } from "@emotion/react"
import InputBase from "@mui/material/InputBase"
import type { InputBaseProps } from "@mui/material/InputBase"
import type { Theme } from "@mui/material/styles"
import classnames from "classnames"

type Size = "small" | "medium" | "large" | "chat" | "hero"
type CustomInputProps = {
  /**
   * If true, the input will display one size smaller at mobile breakpoint.
   */
  responsive?: boolean
}
type MuiDocOverride = {
  size?: Size
  /**
   * Slot for icon adornments.
   *
   * If the icon is a button, use `AdornmentButton` component.
   */
  startAdornment?: React.ReactNode
  /**
   * Slot for icon adornments.
   *
   * If the icon is a button, use `AdornmentButton` component.
   */
  endAdornment?: React.ReactNode
}

type InputProps = CustomInputProps &
  MuiDocOverride &
  Omit<InputBaseProps, "color" | keyof MuiDocOverride>

const defaultProps = {
  size: "medium",
  multiline: false,
} as const

const responsiveSize: Record<Size, Size> = {
  small: "small",
  medium: "small",
  large: "medium",
  chat: "chat",
  hero: "large",
}

type SizeStyleProps = {
  size: Size
  theme: Theme
  multiline?: boolean
}
const sizeStyles = ({ size, theme, multiline }: SizeStyleProps) =>
  css([
    (size === "small" || size === "medium") && {
      ...theme.typography.body2,
    },
    (size === "large" || size === "chat" || size === "hero") && {
      ".remixicon": {
        width: "24px",
        height: "24px",
      },
      ...theme.typography.body1,
    },
    size === "medium" && {
      paddingLeft: "12px",
      paddingRight: "12px",
    },
    size === "small" &&
      !multiline && {
        height: "32px",
      },
    size === "medium" &&
      !multiline && {
        height: "40px",
      },
    size === "large" &&
      !multiline && {
        height: "48px",
      },
    size === "chat" &&
      !multiline && {
        height: "56px",
      },
    size === "hero" &&
      !multiline && {
        height: "72px",
      },
    size === "small" && {
      padding: "0 8px",
      ".Mit-AdornmentButton": {
        width: "32px",
        ".remixicon": {
          width: "16px",
          height: "16px",
        },
      },
    },
    size === "medium" && {
      padding: "0 12px",
      ".Mit-AdornmentButton": {
        width: "40px",
        ".remixicon": {
          width: "20px",
          height: "20px",
        },
      },
    },
    size === "large" && {
      padding: "0 16px",
      ".Mit-AdornmentButton": {
        width: "48px",
      },
    },
    size === "chat" && {
      padding: "0 16px",
      borderRadius: "8px",
      borderColor: theme.custom.colors.silverGrayLight,
      backgroundColor: theme.custom.colors.white,
      ".Mit-AdornmentButton": {
        padding: "0 16px",
      },
    },
    size === "hero" && {
      padding: "0 24px",
      ".Mit-AdornmentButton": {
        width: "72px",
      },
    },
  ])

/**
 * Base styles for Input and Select components. Includes border, color, hover effects.
 */
const baseInputStyles = (theme: Theme) => ({
  backgroundColor: "white",
  color: theme.custom.colors.darkGray2,
  borderColor: theme.custom.colors.silverGrayLight,
  borderWidth: "1px",
  borderStyle: "solid",
  borderRadius: "4px",
  overflow: "hidden",
  "&.Mui-disabled": {
    backgroundColor: theme.custom.colors.lightGray1,
  },
  "&:hover:not(.Mui-disabled):not(.Mui-focused)": {
    borderColor: theme.custom.colors.darkGray2,
  },
  "&.Mui-focused": {
    /**
     * When change border width, it affects either the elements outside of it or
     * inside based on the border-box setting.
     *
     * Instead of changing the border width, we hide the border and change width
     * using outline.
     */
    borderColor: "transparent",
    outline: "2px solid currentcolor",
    outlineOffset: "-2px",
  },
  "&.Mui-error": {
    borderColor: theme.custom.colors.red,
    outlineColor: theme.custom.colors.red,
  },
  "& input::placeholder, textarea::placeholder": {
    color: theme.custom.colors.silverGrayDark,
    opacity: 1, // some browsers apply opacity to placeholder text
  },
  "& input:placeholder-shown, textarea:placeholder-shown": {
    textOverflow: "ellipsis",
  },
  "& textarea": {
    paddingTop: "8px",
    paddingBottom: "8px",
  },
  "&.MuiInputBase-adornedStart": {
    paddingLeft: "0",
    input: {
      paddingLeft: "8px",
    },
  },
  "&.MuiInputBase-adornedEnd": {
    paddingRight: "0",
    input: {
      paddingRight: "8px",
    },
  },
})

const noForward = Object.keys({
  responsive: true,
} satisfies Record<keyof CustomInputProps, boolean>)

/**
 * Use `Input` for a visually unlabelled input field. If used, it should still
 * have an accessible label, e.g., provided via `aria-label`.
 * For a labeled input field, use `TextField`. instead.
 *
 * **Note:** This component is a styled version of MUI's `InputBase`. See
 * MUI's documentation for full info.
 *
 * - [Smoot Design Input Documentation](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-input--docs)
 * - [InputBase Documentation](https://mui.com/api/input-base/)
 */
const Input: React.FC<InputProps> = styled(InputBase, {
  shouldForwardProp: (prop) => !noForward.includes(prop),
})<InputProps>(({ theme, size = defaultProps.size, multiline, responsive }) => [
  baseInputStyles(theme),
  sizeStyles({ size, theme, multiline }),
  responsive && {
    [theme.breakpoints.down("sm")]: sizeStyles({
      size: responsiveSize[size],
      theme,
      multiline,
    }),
  },
])

const AdornmentButtonStyled = styled.button(({ theme, disabled }) => ({
  // font
  ...theme.typography.button,
  // display
  display: "flex",
  flexShrink: 0,
  justifyContent: "center",
  alignItems: "center",
  // background and border
  border: "none",
  background: "transparent",
  transition: `background ${theme.transitions.duration.short}ms`,
  // cursor
  cursor: disabled ? "default" : "pointer",
  ":disabled": {
    cursor: "default",
    svg: {
      fill: theme.custom.colors.silverGray,
    },
  },
  ":hover:not(:disabled)": {
    background: disabled ? "inherit" : "rgba(0, 0, 0, 0.06)",
  },
  color: theme.custom.colors.silverGray,
  ".MuiInputBase-root:hover &": {
    color: "inherit",
  },
  ".MuiInputBase-root.Mui-focused &": {
    color: "inherit",
  },
  ".MuiInputBase-root.Mui-disabled &": {
    color: "inherit",
  },
  height: "100%",
}))

const noFocus: React.MouseEventHandler = (e) => e.preventDefault()

type AdornmentButtonProps = React.ComponentProps<typeof AdornmentButtonStyled>
/**
 * Button to be used with `startAdornment` and `endAdornment` props on Input and
 * TextField components. AdornmentButton takes care of positioning and other
 * styling concerns.
 *
 * NOTES:
 *  - It is generally expected that the content of the AdornmentButton is a
 *    Remix Icon component. https://remixicon.com/
 *  - By default, the AdornmentButton calls `preventDefault` on `mouseDown`
 *    events. This prevents the button from stealing focus from the input on
 *    click. The button is still focusable via keyboard events. You can override
 *    this behavior by passing your own `onMouseDown` handler.
 */
const AdornmentButton: React.FC<AdornmentButtonProps> = ({
  className,
  ...others
}) => {
  return (
    <AdornmentButtonStyled
      /**
       * If the input is focused and user clicks the AdornmentButton, we don't
       * want to steal focus from the input.
       */
      onMouseDown={noFocus}
      className={classnames("Mit-AdornmentButton", className)}
      {...others}
    />
  )
}

export { AdornmentButton, Input, baseInputStyles }
export type { InputProps, AdornmentButtonProps }
