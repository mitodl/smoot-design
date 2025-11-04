import StarterKit from "@tiptap/starter-kit"
import { renderToHTMLString } from "@tiptap/static-renderer"

const init = () => {
  const rootEl = document.createElement("div")
  document.body.appendChild(rootEl)

  const html = renderToHTMLString({
    extensions: [StarterKit],
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello World!",
            },
          ],
        },
      ],
    },
  })

  rootEl.innerHTML = html
}

export { init }
