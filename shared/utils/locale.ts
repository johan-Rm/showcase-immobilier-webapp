import type { LocaleCode } from '#shared/types/i18n'

import { AVAILABLES_LOCALES, FALLBACK_LOCALE } from '#shared/i18n/config'

export const normalizeLocale = (locale: string): LocaleCode => {
  const lower = locale.toLowerCase()
  const supportedLocales = Object.keys(AVAILABLES_LOCALES) as LocaleCode[]
  const matched = supportedLocales.find((code) => lower === code || lower.startsWith(`${code}-`))
  return matched ?? FALLBACK_LOCALE
}
