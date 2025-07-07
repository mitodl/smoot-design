import * as React from "react"
import { createRoot } from "react-dom/client"
import SyllabusAskTim from "./SyllabusAskTim/SyllabusAskTim"
import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider"

const SyllabusAskTimBundle: React.FC<{ courseId?: string }> = ({
  courseId,
}) => {
  return (
    <ThemeProvider>
      <SyllabusAskTim courseId={courseId} />
    </ThemeProvider>
  )
}

const APP_ID = "syllabus-ask-tim"

const ensureContainer = () => {
  const container = document.getElementById(APP_ID)
  if (!container) {
    const newContainer = document.createElement("div")
    newContainer.id = APP_ID
    document.body.appendChild(newContainer)
    return newContainer
  }
  return container
}
const init = ({ courseId }: { courseId?: string }) => {
  const container = ensureContainer()
  const root = createRoot(container)
  root.render(<SyllabusAskTimBundle courseId={courseId} />)
}

export { init }
