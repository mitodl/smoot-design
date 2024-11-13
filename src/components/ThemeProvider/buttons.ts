import type { ThemeOptions } from "@mui/material/styles"

/**
 * We don't use MUI's button directly, but ButtonBase does get used internally
 * by some MUI components, so we override a few styles.
 */
const buttonBaseComponent: NonNullable<
  ThemeOptions["components"]
>["MuiButtonBase"] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: {
      ":focus-visible": {
        outline: "revert",
      },
    },
  },
}

export { buttonBaseComponent }
