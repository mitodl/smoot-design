import * as React from "react"
import styled from "@emotion/styled"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { Button } from "../Button/Button"
import { Input } from "../Input/Input"
import { StyleIsolation } from "./StyleIsolation"
import { ActionButton } from "../Button/ActionButton"
import { RiArrowRightLine } from "@remixicon/react"
import Grid from "@mui/material/Grid2"

const meta: Meta<typeof StyleIsolation> = {
  title: "smoot-design/StyleIsolation",
  component: StyleIsolation,
  parameters: {
    layout: "padded",
  },
}

export default meta
type Story = StoryObj<typeof StyleIsolation>

/**
 * Conflicting page styles that would normally override component styles.
 */
const ConflictingPageStyles = styled.div(`
  button {
    border: 1px solid red;
    border-radius: 3px;
    box-shadow: inset 0 1px 0 0 #fff;
    color: aqua;
    display: inline-block;
    font-size: inherit;
    font-weight: bold;
    background-color: blue;
    background-image: linear-gradient(red, blue);
    padding: 7px 18px;
    text-decoration: none;
    text-shadow: 0 1px 0 green;
    background-clip: padding-box;
    font-size: 0.8125em;
  }

  input, textarea {
    background-color: red;
    border: 2px solid blue;
  }

  input[type="text"] {
    background: red;
  }

  input:disabled {
    background-image: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
  }
`)

/**
 * StyleIsolation protects child components from conflicting parent page styles.
 */
export const Default: Story = {
  render: () => (
    <ConflictingPageStyles>
      <StyleIsolation>
        <Grid container spacing={2}>
          <Grid>
            <Button>Protected Button</Button>
          </Grid>
          <Grid>
            <Input placeholder="Protected Input" />
          </Grid>
        </Grid>
      </StyleIsolation>
    </ConflictingPageStyles>
  ),
}

/**
 * StyleIsolation can wrap multiple components.
 */
export const MultipleComponents: Story = {
  render: () => (
    <ConflictingPageStyles>
      <StyleIsolation>
        <Grid container spacing={2} direction="column">
          <Grid container spacing={2}>
            <Grid>
              <Button variant="primary">Primary</Button>
            </Grid>
            <Grid>
              <Button variant="secondary">Secondary</Button>
            </Grid>
            <Grid>
              <Button variant="text">Text</Button>
            </Grid>
          </Grid>
          <Grid>
            <Input placeholder="Protected Input" />
          </Grid>
        </Grid>
      </StyleIsolation>
    </ConflictingPageStyles>
  ),
}

/**
 * StyleIsolation protects components from conflicting parent styles.
 * Notice that the buttons maintain their intended styling despite
 * the conflicting page styles.
 */
export const PageStyleResistance: Story = {
  render: () => (
    <ConflictingPageStyles>
      <Grid container spacing={2} direction="column">
        <Grid>
          <h3>Without StyleIsolation:</h3>
          <Grid container spacing={2} direction="column">
            <Grid container spacing={2}>
              <Grid>
                <Button variant="primary">Affected Button</Button>
              </Grid>
              <Grid>
                <Button variant="secondary">Affected Secondary</Button>
              </Grid>
              <Grid>
                <ActionButton>
                  <RiArrowRightLine />
                </ActionButton>
              </Grid>
            </Grid>
            <Grid>
              <Input placeholder="Affected Input" />
            </Grid>
            <Grid>
              <Input placeholder="Affected Multiline Input" multiline />
            </Grid>
          </Grid>
        </Grid>
        <Grid>
          <h3>With StyleIsolation:</h3>
          <StyleIsolation>
            <Grid container spacing={2} direction="column">
              <Grid container spacing={2}>
                <Grid>
                  <Button variant="primary">Protected Button</Button>
                </Grid>
                <Grid>
                  <Button variant="secondary">Protected Secondary</Button>
                </Grid>
                <Grid>
                  <ActionButton>
                    <RiArrowRightLine />
                  </ActionButton>
                </Grid>
              </Grid>
              <Grid>
                <Input placeholder="Protected Input" />
              </Grid>
              <Grid>
                <Input placeholder="Protected Multiline Input" multiline />
              </Grid>
            </Grid>
          </StyleIsolation>
        </Grid>
      </Grid>
    </ConflictingPageStyles>
  ),
}

/**
 * Tests specificity against complex parent selectors like form button[type="button"].
 * StyleIsolation applies resets with e.g. &&& button (3 ampersands) ie. .Mit-isolated.Mit-isolated.Mit-isolated .css-abc123.css-abc123.css-abc123 button (0,6,1)
 * which will override form button[type="button"] (0,1,2).
 * Component styles use .Mit-isolated.Mit-isolated.Mit-isolated .css-xyz789 (0,4,0) to override StyleIsolation's resets.
 */
export const ComplexParentSelectors: Story = {
  render: () => {
    const ComplexParentStyles = styled.div(`
      /* These selectors have various specificity levels */
      button {
        background-color: red;
        border: 3px solid orange;
        padding: 30px;
        font-size: 30px;
      }

      button[type="button"] {
        background-color: purple;
        border: 3px solid pink;
      }

      form button[type="button"] {
        background-color: yellow;
        border: 3px solid green;
      }
    `)

    return (
      <ComplexParentStyles>
        <form>
          <Grid container spacing={2} direction="column">
            <Grid>
              <p>Without StyleIsolation (affected by parent styles):</p>
              <Button variant="primary">Affected Button Component</Button>
            </Grid>
            <Grid>
              <p>
                With StyleIsolation (&&& button = 0,6,1 after plugin overrides
                form button[type="button"] = 0,1,2 via higher specificity;
                component uses .Mit-isolated.Mit-isolated.Mit-isolated
                .css-xyz789 = 0,4,0 to override resets):
              </p>
              <StyleIsolation>
                <Button variant="primary">Protected Button Component</Button>
              </StyleIsolation>
            </Grid>
          </Grid>
        </form>
      </ComplexParentStyles>
    )
  },
}

/**
 * Demonstrates styled component overrides with custom resets.
 *
 * When using StyleIsolation with customResets, styled components need sufficient
 * specificity to override both the custom reset and the component's own styles.
 *
 * - Default reset uses: `button` → After Stylis plugin: `.Mit-isolated.Mit-isolated.Mit-isolated button` (0,3,1)
 * - Custom reset uses: `& button` (1 ampersand) = `.css-abc123 button` → After plugin: `.Mit-isolated.Mit-isolated.Mit-isolated .css-abc123 button` (0,4,1)
 * - Component styles get: `.Mit-isolated.Mit-isolated.Mit-isolated .css-xyz789` (0,4,0 specificity)
 * - Using `&&` (2 ampersands) in styled components gives us `.Mit-isolated.Mit-isolated.Mit-isolated .css-xyz789.css-xyz789` (0,5,0 specificity)
 *   which is higher than component styles (0,4,0) and custom reset (0,4,1) for class-based properties
 */
export const OverridesWithCustomResets: Story = {
  render: () => {
    // Styled button - won't override custom reset
    // Normal styled component styles have (0,0,0) specificity, which is lower than both
    const WeakOverrideButton = styled(Button)({
      backgroundColor: "#10b981",
      border: "3px solid #059669",
    })

    // Styled button with "&&": (2 ampersands) - will override custom reset
    const StrongOverrideButton = styled(Button)({
      "&&": {
        backgroundColor: "#10b981",
        border: "3px solid #059669",
      },
      "&&:hover:not(:disabled)": {
        backgroundColor: "#059669",
        border: "3px solid #10b981",
      },
    })

    return (
      <ConflictingPageStyles>
        <StyleIsolation
          customResets={{
            button: {
              backgroundColor: "orange",
              border: "10px solid blue",
            },
          }}
        >
          <Grid container spacing={2} direction="column">
            <Grid>
              <p>
                Custom reset applies to default Button (orange bg, blue border):
              </p>
              <Button variant="primary">Default Button</Button>
            </Grid>
            <Grid>
              <p>
                Styled WITHOUT && - custom reset wins (orange bg, blue border):
              </p>
              <WeakOverrideButton variant="primary">
                Weak Override (No &&)
              </WeakOverrideButton>
            </Grid>
            <Grid>
              <p>
                Styled WITH && (2 ampersands) - override takes precedence (green
                bg, green border):
              </p>
              <StrongOverrideButton variant="primary">
                Strong Override (With &&)
              </StrongOverrideButton>
            </Grid>
          </Grid>
        </StyleIsolation>
      </ConflictingPageStyles>
    )
  },
}
