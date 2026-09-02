import * as React from "react"
import styled from "@emotion/styled"
import Menu from "@mui/material/Menu"
import {
  RiAccountCircleFill,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from "@remixicon/react"
import { MenuItem } from "../MenuItem/MenuItem"
import { LinkAdapter } from "../LinkAdapter/LinkAdapter"
import { ButtonLink } from "../Button/Button"
import { ActionButtonLink } from "../Button/ActionButton"

type UserMenuItem = {
  key: string
  label: React.ReactNode
  href: string
  /**
   * Defaults to the theme's LinkAdapter, i.e. an `a` tag unless the app
   * overrides it. Pass `"a"` to force a full page load in an app that routes
   * client-side.
   */
  LinkComponent?: React.ElementType
}

type UserMenuProps = {
  /** Omit to render the logged-out login button. */
  user?: { name?: string | null }
  items?: UserMenuItem[]
  loginUrl: string
  /** Which login affordance to show when logged out. */
  variant?: "desktop" | "mobile"
  className?: string
}

const Trigger = styled.button(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  background: "none",
  color: theme.custom.colors.white,
  height: "40px",
  border: `1px solid ${theme.custom.colors.silverGrayDark}`,
  borderRadius: "4px",
  padding: "2px 8px",
  gap: "8px",
  font: "inherit",
  opacity: 0.75,
  "&:hover": {
    opacity: 1,
  },
  [theme.breakpoints.down("md")]: {
    border: "none",
    opacity: 1,
    gap: "2px",
    padding: "4px 0",
  },
}))

const UserIcon = styled(RiAccountCircleFill)(({ theme }) => ({
  color: theme.custom.colors.white,
}))

const UserName = styled.span(({ theme }) => ({
  color: theme.custom.colors.white,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
  ...theme.typography.body2,
}))

/**
 * Composed with `styled` rather than `sx`: smoot's MenuItem is an
 * @emotion/styled component, and its class beats MUI's sx class in the
 * cascade, so `sx` overrides here are silently dropped.
 */
const MenuLink = styled(MenuItem)(({ theme }) => ({
  backgroundColor: theme.custom.colors.darkGray1,
  color: theme.custom.colors.white,
  padding: "8px 0",
  "&:hover, &.Mui-focusVisible": {
    backgroundColor: theme.custom.colors.darkGray1,
    textDecoration: "underline",
  },
}))

const MobileLoginButton = styled(ActionButtonLink)({
  width: "24px",
  height: "24px",
})

const DesktopLoginButton = styled(ButtonLink)({
  height: "40px",
  padding: "18px 12px",
})

/**
 * The account trigger and dropdown used in the MIT Learn and OCW headers.
 *
 * This component owns its appearance but not its placement; wrap it or pass
 * `className` to position it within a header.
 *
 * Auth state is the caller's concern: fetch the user yourself and omit `user`
 * to get the logged-out login button. Render one instance per breakpoint,
 * passing the matching `variant`, so the login affordance matches the header
 * it sits in.
 */
const UserMenu: React.FC<UserMenuProps> = ({
  user,
  items = [],
  loginUrl,
  variant = "desktop",
  className,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const open = !!anchorEl

  if (!user) {
    return variant === "mobile" ? (
      <MobileLoginButton
        className={className}
        edge="circular"
        variant="text"
        href={loginUrl}
        aria-label="Log in"
      >
        <UserIcon />
      </MobileLoginButton>
    ) : (
      <DesktopLoginButton
        className={className}
        size="small"
        variant="tertiary"
        href={loginUrl}
      >
        Log In
      </DesktopLoginButton>
    )
  }

  return (
    <>
      <Trigger
        className={className}
        type="button"
        aria-label="User Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <UserIcon />
        <UserName>{user.name ?? ""}</UserName>
        {open ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
      </Trigger>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              borderRadius: "0px 0px 5px 5px",
              backgroundColor: theme.custom.colors.darkGray1,
              padding: "0 16px",
              ...theme.typography.body2,
            }),
          },
          list: { sx: { padding: "8px 0" } },
        }}
      >
        {items.map(({ key, label, href, LinkComponent }) => (
          <MenuLink
            key={key}
            /**
             * Renders the item as a link rather than an <li>. Technically
             * invalid HTML, but the most accessible option MUI offers.
             * See https://github.com/mui/material-ui/issues/33268
             *
             * Cast because MUI only infers `component`'s extra props (`href`)
             * when the component type is known statically; `LinkComponent` is
             * resolved at runtime, so no prop typing can recover the inference.
             */
            {...({
              component: LinkComponent ?? LinkAdapter,
              href,
            } as { component: React.ElementType; href: string })}
            onClick={() => setAnchorEl(null)}
          >
            {label}
          </MenuLink>
        ))}
      </Menu>
    </>
  )
}

export { UserMenu }
export type { UserMenuProps, UserMenuItem }
