import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { Button } from "../Button/Button"
import { Input } from "../Input/Input"
import { StyleIsolation } from "./StyleIsolation"
import styled from "@emotion/styled"
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

  input {
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
 * Notice how the buttons maintain their intended styling despite
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
 * StyleIsolation can be styled itself using the sx prop.
 */
export const StyledContainer: Story = {
  render: () => (
    <StyleIsolation
      sx={{
        padding: "24px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Grid container spacing={2} direction="column">
        <Grid container spacing={2}>
          <Grid>
            <Button variant="primary">Button 1</Button>
          </Grid>
          <Grid>
            <Button variant="secondary">Button 2</Button>
          </Grid>
        </Grid>
        <Grid>
          <Input placeholder="Protected Input" />
        </Grid>
      </Grid>
    </StyleIsolation>
  ),
}

/**
 * StyleIsolation protects components while still allowing intentional overrides
 * using Emotion's styled() function. The styled() overrides take precedence
 * because they have higher specificity than the StyleIsolation resets.
 */
export const IntentionalOverrides: Story = {
  render: () => {
    // Create styled versions of Button with intentional overrides
    const StyledPrimaryButton = styled(Button)(({ theme }) => ({
      backgroundColor: theme.custom.colors.darkGray1,
      color: theme.custom.colors.white,
      borderRadius: "8px",
      padding: "16px 32px",
      fontSize: "18px",
      ...theme.typography.subtitle1,
      "&:hover:not(:disabled)": {
        backgroundColor: theme.custom.colors.darkGray2,
        transform: "scale(1.05)",
        transition: "transform 0.2s ease",
      },
    }))

    const StyledSecondaryButton = styled(Button)(({ theme }) => ({
      border: `2px solid ${theme.custom.colors.mitRed}`,
      borderRadius: "20px",
      padding: "12px 24px",
      ...theme.typography.body1,
      textTransform: "uppercase",
      letterSpacing: "1px",
    }))

    return (
      <ConflictingPageStyles>
        <Grid container spacing={3} direction="column">
          <Grid>
            <h3>Default Components (Protected):</h3>
            <StyleIsolation>
              <Grid container spacing={2} direction="column">
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="primary">Default Primary</Button>
                  </Grid>
                  <Grid>
                    <Button variant="secondary">Default Secondary</Button>
                  </Grid>
                  <Grid>
                    <ActionButton>
                      <RiArrowRightLine />
                    </ActionButton>
                  </Grid>
                </Grid>
                <Grid>
                  <Input placeholder="Default Input" />
                </Grid>
              </Grid>
            </StyleIsolation>
          </Grid>

          <Grid>
            <h3>Styled Components with Intentional Overrides:</h3>
            <StyleIsolation>
              <Grid container spacing={2} direction="column">
                <Grid container spacing={2}>
                  <Grid>
                    <StyledPrimaryButton variant="primary">
                      Custom Styled Primary
                    </StyledPrimaryButton>
                  </Grid>
                  <Grid>
                    <StyledSecondaryButton variant="secondary">
                      Custom Styled Secondary
                    </StyledSecondaryButton>
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
              </Grid>
            </StyleIsolation>
          </Grid>

          <Grid>
            <h3>Mixed: Default + Styled (Both Protected):</h3>
            <StyleIsolation>
              <Grid container spacing={2} direction="column">
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="primary">Default</Button>
                  </Grid>
                  <Grid>
                    <StyledPrimaryButton variant="primary">
                      Styled Override
                    </StyledPrimaryButton>
                  </Grid>
                  <Grid>
                    <Button variant="text">Default Text</Button>
                  </Grid>
                </Grid>
                <Grid>
                  <Input placeholder="Protected Input" />
                </Grid>
              </Grid>
            </StyleIsolation>
          </Grid>
        </Grid>
      </ConflictingPageStyles>
    )
  },
}

/**
 * Demonstrates that styled() overrides work even with StyleIsolation's
 * customResets, showing the override API is fully functional.
 */
/**
 * Tests specificity against complex parent selectors like form button[type="button"].
 * StyleIsolation uses & button (0,1,1) which will override form button[type="button"] (0,1,2)
 * due to source order (later styles win when specificity ties).
 * Component styles use .css-abc123 && (0,2,0) to override StyleIsolation's resets.
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
                With StyleIsolation (& button = 0,1,1 overrides form
                button[type="button"] = 0,1,2 via source order; component uses
                .css-abc123 && = 0,2,0 to override resets):
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

export const OverridesWithCustomResets: Story = {
  render: () => {
    // Styled button WITHOUT &&& - won't override custom reset
    // Custom reset uses: & button = .css-abc123 button (0,1,1 specificity)
    // Component's useStyleIsolation uses: .css-abc123 && (0,2,0 specificity)
    // Normal styled component styles have (0,0,0) specificity, which is lower than both
    const WeakOverrideButton = styled(Button)({
      backgroundColor: "#10b981",
      color: "white",
      border: "3px solid #059669",
      borderRadius: "16px",
      padding: "20px 40px",
    })

    // Styled button WITH &&& (3 ampersands) - will override custom reset
    // Custom reset: & button = .css-abc123 button (0,1,1 specificity)
    // Component's useStyleIsolation uses: .css-abc123 && (0,2,0 specificity)
    // Using &&& gives us 0,3,0 (3 classes) which is higher specificity than both 0,1,1 and 0,2,0
    // This ensures our styled component styles win over the custom reset
    const StrongOverrideButton = styled(Button)(({ theme }) => ({
      // Use &&& (3 ampersands) to exceed custom reset's & button (0,1,1) and
      // component's useStyleIsolation .css-abc123 && (0,2,0)
      // This gives us 0,3,0 which is higher specificity
      "&&&": {
        backgroundColor: "#10b981",
        color: "white",
        border: "3px solid #059669",
        borderRadius: "16px",
        padding: "20px 40px",
        fontSize: "20px",
        ...theme.typography.subtitle1,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
      "&&&:hover:not(:disabled)": {
        backgroundColor: "#059669",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      },
    }))

    return (
      <ConflictingPageStyles>
        <StyleIsolation
          customResets={{
            button: {
              backgroundColor: "transparent",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px 16px",
            },
          }}
        >
          <Grid container spacing={2} direction="column">
            <Grid>
              <p>
                Custom reset applies to default Button (transparent bg, small
                padding):
              </p>
              <Button variant="primary">Default Button</Button>
            </Grid>
            <Grid>
              <p>
                Styled WITHOUT &&& - custom reset wins (transparent bg, small
                padding):
              </p>
              <WeakOverrideButton variant="primary">
                Weak Override (No &&&)
              </WeakOverrideButton>
            </Grid>
            <Grid>
              <p>
                Styled WITH &&& (3 ampersands) - override takes precedence
                (green bg, large padding):
              </p>
              <StrongOverrideButton variant="primary">
                Strong Override (With &&&)
              </StrongOverrideButton>
            </Grid>
          </Grid>
        </StyleIsolation>
      </ConflictingPageStyles>
    )
  },
}
