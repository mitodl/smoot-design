import * as React from "react"
import MuiTab from "@mui/material/Tab"
import type { TabProps } from "@mui/material/Tab"
import MuiTabList from "@mui/lab/TabList"
import type { TabListProps } from "@mui/lab/TabList"
import styled from "@emotion/styled"
import { Button, ButtonLink } from "../Button/Button"
import type { ButtonLinkProps, ButtonProps } from "../Button/Button"
import { css } from "@emotion/react"
import type { Theme } from "@mui/material/styles"
import { withStyleOverrides } from "../../utils/styles"

const defaultTabListProps = {
  variant: "scrollable",
  allowScrollButtonsMobile: true,
  scrollButtons: "auto",
} as const

type StyleVariant = "chat"

type TabButtonListProps = TabListProps & {
  styleVariant?: StyleVariant
}

const TabButtonList: React.FC<TabButtonListProps> = styled(
  ({ styleVariant, ...props }: TabButtonListProps) => (
    <MuiTabList {...defaultTabListProps} {...props} />
  ),
)(({ theme, styleVariant }) => ({
  minHeight: "unset",
  ".MuiTabs-indicator": {
    display: "none",
  },
  ".MuiTabs-flexContainer": {
    gap: "8px",
    alignItems: "center",
  },
  ".MuiTabs-scroller": {
    display: "flex",
  },
  ...(styleVariant === "chat" && {
    flexGrow: 1,
    ".MuiTabs-flexContainer": {
      flexGrow: 1,
      gap: "8px",
      alignItems: "center",
      backgroundColor: theme.custom.colors.lightGray1,
      padding: "4px",
      borderRadius: "8px",
    },
    button: {
      flexGrow: 1,
      backgroundColor: "transparent",
      ...theme.typography.body2,
    },
    "button[aria-selected=true], button[aria-selected=true]:hover": {
      backgroundColor: theme.custom.colors.darkGray1,
      color: theme.custom.colors.white,
      cursor: "default",
    },
  }),
}))

const tabStyles = ({ theme }: { theme: Theme }) =>
  css(
    withStyleOverrides({
      minWidth: "auto",
      ":focus-visible": {
        outlineOffset: "-1px",
      },
      '&[aria-selected="true"]': {
        backgroundColor: theme.custom.colors.white,
        borderColor: theme.custom.colors.darkGray2,
      },
    }),
  )

const TabButtonStyled = styled(Button)(tabStyles)
const TabLinkStyled = styled(ButtonLink)(tabStyles)

const defaultTabButtonProps = {
  variant: "tertiary",
  size: "small",
} as const

const TabButtonInner = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // Omits the `className` prop from the underlying Button so that MUI does not
  // style it. We style it ourselves.
  (props, ref) => {
    const { className, ...others } = props
    return <TabButtonStyled {...defaultTabButtonProps} {...others} ref={ref} />
  },
)

TabButtonInner.displayName = "TabButtonInner"

const TabLinkInner = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (props, ref) => {
    const { className, ...others } = props
    return (
      <TabLinkStyled {...defaultTabButtonProps} {...others} ref={ref}>
        {props.children}
      </TabLinkStyled>
    )
  },
)

TabLinkInner.displayName = "TabLinkInner"

type TabButtonProps = Omit<TabProps<"button">, "color"> & {
  styleVariant?: StyleVariant
}

/**
 * Wrapper around [MUI Tab](https://mui.com/material-ui/api/tab/) using our
 * Button as the `component` implementation.
 */
const TabButton = (props: TabButtonProps) => (
  <MuiTab {...props} component={TabButtonInner} />
)

/**
 * Wrapper around [MUI Tab](https://mui.com/material-ui/api/tab/) using our
 * ButtonLink as the `component` implementation.
 */
const TabButtonLink = ({ ...props }: TabProps<typeof TabLinkInner>) => (
  <MuiTab {...props} component={TabLinkInner} />
)

export { TabButtonList, TabButton, TabButtonLink }
export type { TabButtonListProps, TabButtonProps }
