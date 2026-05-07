import type { LocaleCode, LocaleInfo } from '#shared/types/i18n'

export const AVAILABLES_LOCALES = {
  fr: { code: 'fr', iso: 'fr-FR', name: 'Français', dir: 'ltr', flag: '🇫🇷' },
  en: { code: 'en', iso: 'en-US', name: 'English', dir: 'ltr', flag: '🇺🇸' },
  es: { code: 'es', iso: 'es-ES', name: 'Español', dir: 'ltr', flag: '🇪🇸' },
} as const satisfies Record<LocaleCode, LocaleInfo>

export const FALLBACK_LOCALE: LocaleCode = 'fr'

export const isLocaleCode = (code: string | undefined): code is LocaleCode =>
  Boolean(code && code in AVAILABLES_LOCALES)
