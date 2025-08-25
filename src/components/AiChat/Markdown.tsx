import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeMathjax from "rehype-mathjax/browser"
import remarkMath from "remark-math"
import { MathJax } from "better-react-mathjax"
import remarkSupersub from "remark-supersub"

type MarkdownProps = {
  children?: string
  enableMathjax?: boolean
}
const Markdown: React.FC<MarkdownProps> = ({ children, enableMathjax }) => {
  const remarkPlugins = enableMathjax
    ? [remarkMath, remarkSupersub]
    : [remarkSupersub]
  const rehypePlugins = enableMathjax ? [rehypeMathjax] : undefined

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
      {children}
    </ReactMarkdown>
  )

  return enableMathjax ? <MathJax>{markdown}</MathJax> : markdown
}

export default Markdown
