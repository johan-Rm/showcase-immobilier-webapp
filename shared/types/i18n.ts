export type LocaleCode = 'fr' | 'en' | 'es'

export type LocaleInfo = {
  code: LocaleCode
  iso: string
  name: string
  dir: 'ltr' | 'rtl'
  flag: string
}
