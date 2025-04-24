import * as React from "react"
import { styled } from "@mui/material/styles"
import InputBase from "@mui/material/InputBase"
import type { InputBaseProps } from "@mui/material/InputBase"
import type { Theme } from "@mui/material/styles"
import classnames from "classnames"

type Size = "small" | "medium" | "large" | "hero"
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

const responsiveSize: Record<Size, Size> = {
  small: "small",
  medium: "small",
  large: "medium",
  hero: "large",
}

type SizeStyleProps = {
  theme: Theme
  size: Size
  multiline?: boolean
}
const sizeStyles = ({ theme, size }: SizeStyleProps) => {
  return Object.assign(
    {},
    (size === "small" || size === "medium") && {
      ...theme.typography.body2,
    },
    (size === "large" || size === "hero") && {
      "&& .remixicon": {
        width: "24px",
        height: "24px",
      },
      ...theme.typography.body1,
    },
    size === "small" && {
      height: "32px",
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
      height: "40px",
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
      height: "48px",
      padding: "0 16px",
      ".Mit-AdornmentButton": {
        width: "48px",
      },
    },
    size === "hero" && {
      height: "72px",
      padding: "0 24px",
      ".Mit-AdornmentButton": {
        width: "72px",
      },
    },
  )
}

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

const SIZES = ["small", "medium", "large", "hero"] as const

/**
 * Use `Input` for a visually unlabelled input field. If used, it should still
 * have an accessible label, e.g., provided via `aria-label`.
 * For a labeled input field, use `TextField`. instead.
 *
 * **Note:** This component is a styled version of MUI's `InputBase`. See
 * MUI's documentation for full info.
 *
 * - [Smoot Design Input Documentation](https://mitodl.github.io/smoot-design/https://mitodl.github.io/smoot-design/)
 * - [InputBase Documentation](https://mui.com/api/input-base/)
 */
const Input = styled(InputBase, {
  shouldForwardProp: (prop: string) => !noForward.includes(prop),
})<InputProps>(({ theme }) => ({
  ...baseInputStyles(theme),
  ...sizeStyles({ theme, size: "medium" }),
  variants: [
    ...SIZES.flatMap((size) => [
      {
        props: { size },
        style: sizeStyles({ theme, size }),
      },
      {
        props: { size, responsive: true },
        style: {
          [theme.breakpoints.down("sm")]: sizeStyles({
            theme,
            size: responsiveSize[size],
          }),
        },
      },
    ]),
    {
      props: { multiline: true },
      style: { height: "unset" },
    },
  ],
}))

const AdornmentButtonStyled = styled("button")(({ theme }) => ({
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
  cursor: "pointer",
  ":disabled": {
    cursor: "default",
  },
  ":hover": {
    background: "rgba(0, 0, 0, 0.06)",
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
