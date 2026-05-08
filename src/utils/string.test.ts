import { stripMarkdown } from "./string"

describe("stripMarkdown", () => {
  it("removes bold markers", () => {
    expect(stripMarkdown("**bold text**")).toBe("bold text")
    expect(stripMarkdown("__bold text__")).toBe("bold text")
  })

  it("removes italic markers", () => {
    expect(stripMarkdown("*italic text*")).toBe("italic text")
    expect(stripMarkdown("_italic text_")).toBe("italic text")
  })

  it("removes headers", () => {
    expect(stripMarkdown("# Heading 1")).toBe("Heading 1")
    expect(stripMarkdown("## Heading 2")).toBe("Heading 2")
    expect(stripMarkdown("### Heading 3")).toBe("Heading 3")
  })

  it("removes fenced code blocks", () => {
    expect(stripMarkdown("```\nconst x = 1\n```")).toBe("")
    expect(stripMarkdown("```js\nconst x = 1\n```")).toBe("")
  })

  it("removes inline code markers but keeps content", () => {
    expect(stripMarkdown("`inline code`")).toBe("inline code")
  })

  it("removes image syntax", () => {
    expect(stripMarkdown("![alt text](image.png)")).toBe("")
  })

  it("removes link syntax but keeps link text", () => {
    expect(stripMarkdown("[link text](https://example.com)")).toBe("link text")
  })

  it("removes list markers", () => {
    expect(stripMarkdown("- item one\n- item two")).toBe("item one\nitem two")
    expect(stripMarkdown("* item one\n* item two")).toBe("item one\nitem two")
    expect(stripMarkdown("1. first\n2. second")).toBe("first\nsecond")
  })

  it("removes strikethrough markers", () => {
    expect(stripMarkdown("~~strikethrough~~")).toBe("strikethrough")
  })

  it("removes blockquote markers", () => {
    expect(stripMarkdown("> quoted text")).toBe("quoted text")
  })

  it("handles mixed markdown in a typical LLM response", () => {
    const input =
      "## Summary\n\nThis is **important** and _also_ relevant.\n\n- Point one\n- Point two\n\n`code` is useful."
    const result = stripMarkdown(input)
    expect(result).not.toMatch(/[*_#`]/)
    expect(result).toContain("Summary")
    expect(result).toContain("important")
    expect(result).toContain("Point one")
    expect(result).toContain("code")
  })

  it("returns plain text unchanged", () => {
    expect(stripMarkdown("plain text with no markdown")).toBe(
      "plain text with no markdown",
    )
  })
})
