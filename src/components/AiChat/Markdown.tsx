import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeMathjax from "rehype-mathjax/browser"
import remarkMath from "remark-math"
import { MathJax } from "better-react-mathjax"
import rehypeRaw from "rehype-raw"

type MarkdownProps = {
  children?: string
  enableMathjax?: boolean
}
const Markdown: React.FC<MarkdownProps> = ({ children, enableMathjax }) => {
  const remarkPlugins = enableMathjax ? [remarkMath] : undefined
  const rehypePlugins = enableMathjax ? [rehypeRaw, rehypeMathjax] : [rehypeRaw]

  const markdown = (
    <ReactMarkdown
      disallowedElements={["script", "applet", "iframe", "link"]}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
    >
      {children}
    </ReactMarkdown>
  )

  return enableMathjax ? <MathJax>{markdown}</MathJax> : markdown
}

export default Markdown
