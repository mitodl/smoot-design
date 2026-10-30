import * as React from "react"
import { render, screen } from "@testing-library/react"
import { StyleIsolation } from "./StyleIsolation"
import { ISOLATION_CLASS_NAME } from "./increaseSpecificityPlugin"

// jsdom's getComputedStyle does not resolve Emotion's generated rules, so read
// the injected rule back and inspect its text.
const ruleFor = (element: HTMLElement) => {
  // Every root also carries the shared ISOLATION_CLASS_NAME, which would match
  // a rule left in the sheet by an earlier render. Only the hashed class
  // identifies this element's own rule.
  const hashed = Array.from(element.classList).filter(
    (name) => name !== ISOLATION_CLASS_NAME,
  )
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (hashed.some((name) => rule.cssText.includes(name))) {
        return rule.cssText
      }
    }
  }
  return null
}

const isolationRoot = (props = {}) => {
  render(
    <StyleIsolation {...props}>
      <button>Inside</button>
    </StyleIsolation>,
  )
  return screen.getByRole("button", { name: "Inside" })
    .parentElement as HTMLElement
}

test("isolates the stacking context by default", () => {
  const root = isolationRoot()

  expect(ruleFor(root)).toContain("isolation: isolate")
})

test("omits the stacking context when isolateStacking is false", () => {
  const root = isolationRoot({ isolateStacking: false })

  expect(ruleFor(root)).not.toContain("isolation: isolate")
})

// Dropping the stacking context is only safe because the style protection
// never came from it -- it comes from the high-specificity selectors.
test("keeps the specificity-raised resets when the stacking context is dropped", () => {
  const root = isolationRoot({ isolateStacking: false })

  expect(ruleFor(root)).toContain("contain: style")
})
