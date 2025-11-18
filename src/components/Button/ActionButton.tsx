import * as React from "react"
import styled from "@emotion/styled"
import { pxToRem } from "../ThemeProvider/typography"
import {
  ButtonRoot,
  ButtonLinkRoot,
  RESPONSIVE_SIZES,
  DEFAULT_PROPS,
} from "./Button"
import type { ButtonStyleProps, ButtonSize } from "./Button"
import type { LinkAdapterPropsOverrides } from "../LinkAdapter/LinkAdapter"
import { useStyleIsolation } from "../StyleIsolation/StyleIsolation"

type ActionButtonStyleProps = Omit<ButtonStyleProps, "startIcon" | "endIcon">
type ActionButtonProps = ActionButtonStyleProps & React.ComponentProps<"button">

const actionStyles = (size: ButtonSize) => {
  return {
    minWidth: "auto",
    padding: 0,
    height: {
      small: "32px",
      medium: "40px",
      large: "48px",
    }[size],
    width: {
      small: "32px",
      medium: "40px",
      large: "48px",
    }[size],
    "& svg, & .MuiSvgIcon-root": {
      width: "1em",
      height: "1em",
      fontSize: pxToRem(
        {
          small: 20,
          medium: 24,
          large: 32,
        }[size],
      ),
    },
  }
}
/**
 * A button that should contain a remixicon icon and nothing else.
 * See [ActionButton docs](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-actionbutton--docs).
 *
 * See also:
 * - [ActionButtonLink](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-actionbutton--docs#links)
 * - [Button](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-button--docs) for text buttons
 */
const ActionButton = styled(
  React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    function Root(props, ref) {
      return <ButtonRoot ref={ref} type="button" {...props} />
    },
  ),
)(({ size = DEFAULT_PROPS.size, responsive, theme }) => {
  return [
    useStyleIsolation(actionStyles(size)),
    responsive && {
      [theme.breakpoints.down("sm")]: useStyleIsolation(
        actionStyles(RESPONSIVE_SIZES[size]),
      ),
    },
  ]
})
ActionButton.displayName = "ActionButton"

type ActionButtonLinkProps = ActionButtonStyleProps &
  React.ComponentProps<"a"> & {
    Component?: React.ElementType
  } & LinkAdapterPropsOverrides

/**
 * See [ActionButtonLink docs](https://mitodl.github.io/smoot-design/?path=/docs/smoot-design-actionbutton--docs#links)
 */
const ActionButtonLink = ActionButton.withComponent(
  ({ Component, ...props }: ActionButtonLinkProps) => {
    return <ButtonLinkRoot Component={Component} {...props} />
  },
)
ActionButtonLink.displayName = "ActionButtonLink"

export { ActionButton, ActionButtonLink, DEFAULT_PROPS }

export type { ActionButtonProps, ActionButtonLinkProps }
