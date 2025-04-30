import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeMathjax from "rehype-mathjax/browser"
import remarkMath from "remark-math"
import { MathJax } from "better-react-mathjax"

type MarkdownProps = {
  children?: string
  enableMathjax?: boolean
}
const Markdown: React.FC<MarkdownProps> = ({ children, enableMathjax }) => {
  const remarkPlugins = enableMathjax ? [remarkMath] : undefined
  const rehypePlugins = enableMathjax ? [rehypeMathjax] : undefined

  const markdown = (
    <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
      {children}
    </ReactMarkdown>
  )

  return enableMathjax ? <MathJax>{markdown}</MathJax> : markdown
}

export default Markdown
