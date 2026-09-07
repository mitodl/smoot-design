import { render, screen } from "@testing-library/react"
import * as React from "react"
import {
  TranslationProvider,
  useTranslation,
  TRANSLATION_KEYS,
  DEFAULT_TRANSLATIONS,
  type TranslationFn,
  type TranslationsInput,
} from "./TranslationContext"

const KEY = TRANSLATION_KEYS.aiDrawer.returnToVideo
const DEFAULT_LABEL = DEFAULT_TRANSLATIONS[KEY] // "Return to the video"

const Consumer = ({ tKey }: { tKey: typeof KEY }) => {
  const { t } = useTranslation()
  return <span data-testid="out">{t(tKey)}</span>
}

const renderWith = (translations: TranslationsInput | null) =>
  render(
    <TranslationProvider translations={translations}>
      <Consumer tKey={KEY} />
    </TranslationProvider>,
  )

const out = () => screen.getByTestId("out").textContent

describe("TranslationProvider resolution", () => {
  test("record path: falls back to the bundled default for a missing key", () => {
    renderWith({}) // empty record, key absent
    expect(out()).toBe(DEFAULT_LABEL)
  })

  test("record path: uses the host-provided string when present", () => {
    renderWith({ [KEY]: "Zurück zum Video" })
    expect(out()).toBe("Zurück zum Video")
  })

  test("function path: uses the host translation when it has one", () => {
    const hostT: TranslationFn = () => "Zurück zum Video"
    renderWith(hostT)
    expect(out()).toBe("Zurück zum Video")
  })

  test("function path: falls back to the bundled default when the host returns the key id (missing message)", () => {
    // react-intl returns the key id verbatim when it has no message for it.
    const hostT: TranslationFn = (key) => key
    renderWith(hostT)
    expect(out()).toBe(DEFAULT_LABEL)
    expect(out()).not.toBe(KEY)
  })
})
