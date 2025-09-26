import * as React from "react"
import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import rehypeMathjax from "rehype-mathjax/browser"
import remarkMath from "remark-math"
import { MathJax } from "better-react-mathjax"
import remarkSupersub from "remark-supersub"
import { contentHash } from "../../utils/string"

/**
 * Component that provides isolation between React and MathJax DOM manipulation.
 *
 * Seeing errors e.g. Error: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
 *
 * MathJax manipulates the DOM directly, and when React tries to reconcile during updates during streaming, it encounters DOM nodes that MathJax has modified or replaced.
 *
 * Here we hash the content to provide a key to ensure React creates new DOM elements when the content changes instead of trying to reconcile with MathJax modifications.
 */
const MathJaxWrapper: React.FC<{
  children: React.ReactElement<{ children: string }>
}> = ({ children }) => {
  const contentKey = useMemo(() => {
    return contentHash(children.props.children || "")
  }, [children])
  return (
    <MathJax key={contentKey} style={{ isolation: "isolate" }}>
      {children}
    </MathJax>
  )
}

type MarkdownProps = {
  children?: string
  useMathJax?: boolean
}

const Markdown: React.FC<MarkdownProps> = ({ children, useMathJax }) => {
  const remarkPlugins = useMathJax
    ? [remarkMath, remarkSupersub]
    : [remarkSupersub]
  const rehypePlugins = useMathJax ? [rehypeMathjax] : undefined

  const markdown = (
    <ReactMarkdown
      skipHtml={true}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={{
        a: ({ href, children, ...props }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
      }}
    >
      {useMathJax ? replaceMathjax(children || "") : children}
    </ReactMarkdown>
  )

  return useMathJax ? <MathJaxWrapper>{markdown}</MathJaxWrapper> : markdown
}

// react-markdown expects Mathjax delimiters to be $...$ or $$...$$
// the prompt for the tutorbot asks for Mathjax tags with $ format but
// the LLM does not get it right all the time
// this function replaces the Mathjax tags with the correct format
// eventually we will probably be able to remove this as LLMs get better
function replaceMathjax(inputString: string): string {
  // Replace instances of \(...\) and \[...\] Mathjax tags with $...$
  // and $$...$$ tags.
  const INLINE_MATH_REGEX = /\\\((.*?)\\\)/g
  const DISPLAY_MATH_REGEX = /\\\[(([\s\S]*?))\\\]/g
  inputString = inputString.replace(
    INLINE_MATH_REGEX,
    (_match, p1) => `$${p1}$`,
  )
  return inputString.replace(DISPLAY_MATH_REGEX, (_match, p1) => `$$${p1}$$`)
}

export default Markdown
export { replaceMathjax }
