import * as React from "react"
import {
  createTheme as muiCreateTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles"
import type { ThemeOptions, Theme } from "@mui/material/styles"
import * as typography from "./typography"
import * as buttons from "./buttons"
import * as chips from "./chips"
import { colors } from "./colors"
import deepmerge from "@mui/utils/deepmerge"

const custom: ThemeOptions["custom"] = {
  colors,
  dimensions: {
    headerHeight: "72px",
    headerHeightSm: "60px",
  },
}

const BREAKPOINTS = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1272 + 48,
    xl: 1536,
  },
}

const defaultThemeOptions: ThemeOptions = {
  custom: custom,
  palette: {
    primary: {
      main: colors.mitRed,
      light: colors.lightRed,
      active: colors.red,
      contrastText: colors.white,
    },
    secondary: {
      light: colors.darkGray2,
      active: colors.silverGrayDark,
      main: colors.black,
      contrastText: colors.white,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  typography: typography.globalSettings,
  breakpoints: BREAKPOINTS,
  components: {
    MuiButtonBase: buttons.buttonBaseComponent,
    MuiTypography: typography.component,
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: "4px" } },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: { borderRadius: "4px" },
        // Mui puts paddingRight: 2px, marginRight: -2px on the popupIndicator,
        // which causes the browser to show a horizontal scrollbar on overflow
        // containers when a scrollbar isn't really necessary.
        popupIndicator: { paddingRight: 0, marginRight: 0 },
      },
    },
    MuiChip: chips.chipComponent,
  },
}

/**
 * Create a customized Smoot Design theme for use with `ThemeProvider`.
 *
 * See [ThemeProvider Docs](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-themeprovider--docs#further-customized-theme-with-createtheme)
 * for more.
 */
const createTheme = (options?: ThemeOptions): Theme => {
  return muiCreateTheme(deepmerge(defaultThemeOptions, options))
}

const defaultTheme = createTheme()

type ThemeProviderProps = {
  children?: React.ReactNode
  theme?: Theme
}

/**
 *
 * @param param0
 * @returns
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = defaultTheme,
}) => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}

export { ThemeProvider, createTheme }
export type { ThemeProviderProps, Theme }
