import * as React from "react"
import { render, screen } from "@testing-library/react"
import { ThemeProvider, createTheme } from "../ThemeProvider/ThemeProvider"
import { ButtonLink } from "./Button"
import { ActionButtonLink } from "./ActionButton"

const withLinkOverride = createTheme({
  custom: {
    LinkAdapter: React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
      function LinkAdapter(props, ref) {
        return (
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a ref={ref} data-custom="theme-default" {...props} />
        )
      },
    ),
  },
})

describe.each([
  //
  { ButtonComponent: ButtonLink },
  { ButtonComponent: ActionButtonLink },
])("$ButtonComponent.displayName overrides", ({ ButtonComponent }) => {
  test("Uses anchor by default", () => {
    render(<ButtonComponent href="/test">Link text here</ButtonComponent>, {
      wrapper: ThemeProvider,
    })
    const link = screen.getByRole("link")
    expect(link.dataset.custom).toBe(undefined)
  })

  test("Uses theme's override if supplied", () => {
    render(<ButtonComponent href="/test">Link text here</ButtonComponent>, {
      wrapper: (props) => <ThemeProvider theme={withLinkOverride} {...props} />,
    })
    const link = screen.getByRole("link")
    expect(link.dataset.custom).toBe("theme-default")
  })

  test("Uses component's override if supplied", () => {
    const LinkImplementation = (props: React.ComponentProps<"a">) => (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a data-custom="anchor-override" {...props} />
    )
    render(
      <ButtonComponent Component={LinkImplementation} href="/test">
        Link text here
      </ButtonComponent>,
      {
        wrapper: (props) => (
          <ThemeProvider theme={withLinkOverride} {...props} />
        ),
      },
    )
    const link = screen.getByRole("link")
    expect(link.dataset.custom).toBe("anchor-override")
  })
})
