export type LocaleCode = 'fr' | 'en' | 'es'

export type LocaleInfo = {
  code: LocaleCode
  iso: string
  name: string
  dir: 'ltr' | 'rtl'
  flag: string
}

/**
 * Locales effectivement activees pour le projet API courant.
 *
 * Distinct de `AVAILABLES_LOCALES` (catalogue compile) : ce contrat est resolu
 * au runtime depuis l'API Symfony et varie selon `SYMFONY_PROJECT_ID`.
 */
export type ProjectLocalesConfig = {
  sourceLocale: LocaleCode
  enabledLocales: LocaleCode[]
}
