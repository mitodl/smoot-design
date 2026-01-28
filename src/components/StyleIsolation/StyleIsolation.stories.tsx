import * as React from "react"
import styled from "@emotion/styled"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { Button } from "../Button/Button"
import { Input } from "../Input/Input"
import { StyleIsolation } from "./StyleIsolation"
import { ActionButton } from "../Button/ActionButton"
import { RiArrowRightLine } from "@remixicon/react"
import Grid from "@mui/material/Grid2"

/**
 * `StyleIsolation` is a best-effort attempt to ensure Smoot Design component
 * styles are not overridden by conflicting page styles. In general, its use
 * should not be necessary. However, in some host environments, such as OpenEdx
 * LMS, global styles may conflict with our component styles.
 *
 * When Smoot Design components are used inside StyleIsolation:
 * - relatively high-priority CSS resets are applied to to Smoot Design components
 *  to neutralize conflicting parent styles.
 * - Smoot Design component styles have increased specificity to override
 */
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
    border: 2px solid blue;
    background-color: aqua;
    color: blue;
    text-decoration: none;
    :hover:not(:disabled) {
      background-color: blue;
      color: aqua;
    }
  }

  input, textarea {
    background-color: red;
    border: 2px solid blue;
    color: blue;
  }

  input[type="text"] {
    background: red;
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
              <Input value="Affected Input" />
            </Grid>
            <Grid>
              <Input value="Affected Multiline Input" multiline />
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
 *
 * StyleIsolation applies resets with e.g. `.mit-isolated-rvau6k.mit-isolated-rvau6k.mit-isolated-rvau6k button` (0,3,1)
 * which will override e.g. `.some-class button` (0, 1, 1) and `form button[type="button"]` (0,1,2).
 *
 * Component styles use e.g. `.mit-isolated.mit-isolated.mit-isolated .mit-isolated-rggkxd` (0,4,0)
 * to override StyleIsolation's resets and reasonably ensure no conflicts with page styles.
 *
 * Note:
 * CSS specificity is calculated as (A, B, C):
 * - A = number of ID selectors.
 * - B = number of class selectors, attribute selectors, and pseudo-classes.
 * - C = number of element selectors and pseudo-elements.
 *
 * The winning selector is the one with the highest A, followed by B, then C, like number systems where
 * A is the most significant digit, ie. (1,0,0) > (0,9,9).
 */
export const ComplexParentSelectors: Story = {
  render: () => {
    const ComplexParentStyles = styled.div(`
      /* These selectors have various specificity levels */
      button {
        background-color: red;
        border: 3px solid orange;
        color: green;
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
              <p>With StyleIsolation:</p>
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
 * Custom resets get increased specificity through StyleIsolation's Stylis plugin,
 * but styled components can still override them with their own increased specificity.
 */
export const OverridesWithCustomResets: Story = {
  render: () => {
    const OverrideButton = styled(Button)({
      backgroundColor: "green",
      border: "2px solid green",
      ":hover:not(:disabled)": {
        backgroundColor: "lightgreen",
        color: "darkgreen",
      },
    })

    return (
      <ConflictingPageStyles>
        <StyleIsolation
          customResets={{
            button: {
              backgroundColor: "orange",
              border: "2px solid blue",
              color: "blue",
              padding: "10px",
              cursor: "pointer",
            },
          }}
        >
          <Grid container spacing={2} direction="column">
            <Grid>
              <p>Custom reset applies to default elements:</p>
              <button>Default Button</button>
            </Grid>
            <Grid>
              <p>
                Custom resets will not override Smoot Design components (unless
                specificity increased in the customResets)
              </p>
              <Button variant="primary">Smoot Button</Button>
            </Grid>
            <Grid>
              <p>Smoot Design components can be styled to override:</p>
              <OverrideButton variant="primary">Styled Override</OverrideButton>
            </Grid>
          </Grid>
        </StyleIsolation>
      </ConflictingPageStyles>
    )
  },
}
