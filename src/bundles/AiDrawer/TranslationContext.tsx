import * as React from "react"
import {
  DEFAULT_TRANSLATIONS,
  type TranslationKey,
  TRANSLATION_KEYS,
} from "./translationKeys"

type TranslationVars = Record<string, string | number>

/**
 * A function that resolves a translation key to a localized string.
 * When provided by the host app, this enables full ICU message format support
 * (pluralization, select, number formatting, etc.) because the host's
 * `intl.formatMessage()` runs at call time with the actual variable values.
 */
type TranslationFn = (key: TranslationKey, vars?: TranslationVars) => string

type Translations = Partial<Record<TranslationKey, string>>

/**
 * Accepted by TranslationProvider and init():
 * - Record: simple key→string map (backward compatible, simple interpolation)
 * - Function: full translation function with ICU support via the host's i18n
 */
type TranslationsInput = Translations | TranslationFn

type TranslationContextValue = {
  t: TranslationFn
}

const TranslationContext = React.createContext<TranslationContextValue | null>(
  null,
)

const getTranslation = (
  translations: Translations,
  key: TranslationKey,
  vars?: TranslationVars,
): string => {
  let text = translations[key] ?? DEFAULT_TRANSLATIONS[key] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
    })
  }
  return text
}

export const TranslationProvider: React.FC<{
  translations?: TranslationsInput | null
  children: React.ReactNode
}> = ({ translations = null, children }) => {
  const value = React.useMemo<TranslationContextValue>(() => {
    if (typeof translations === "function") {
      return { t: translations }
    }
    return {
      t: (key: TranslationKey, vars?: TranslationVars) =>
        getTranslation(translations ?? {}, key, vars),
    }
  }, [translations])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation(): TranslationContextValue {
  const ctx = React.useContext(TranslationContext)
  if (ctx) {
    return ctx
  }
  return {
    t: (key: TranslationKey, vars?: TranslationVars) =>
      getTranslation(DEFAULT_TRANSLATIONS, key, vars),
  }
}

export { TRANSLATION_KEYS, DEFAULT_TRANSLATIONS }
export type {
  TranslationKey,
  Translations,
  TranslationFn,
  TranslationsInput,
  TranslationVars,
}
