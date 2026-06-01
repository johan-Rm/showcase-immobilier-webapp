import type { LocaleCode } from '#shared/types/i18n'

import { getSymfonyServiceToken } from '../../utils/dashboard/symfonyAuth'

type CategoryCodeTranslationPayload = {
  locale: LocaleCode
  label: string
}

type SymfonyCategoryCodeTranslation = {
  locale?: string
  label?: string | null
}

type SymfonyCategoryCode = {
  '@id': string
  code?: string
  codeValue?: string
  inCodeSet: string
  label?: string
  translations?: SymfonyCategoryCodeTranslation[]
}

type CategoryCodeCreateRequest = {
  code?: string
  label?: string
  inCodeSet?: string
  locale?: string
  translations?: unknown
}

const DASHBOARD_LOCALES: LocaleCode[] = ['fr', 'en', 'es']

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

const isLocaleCode = (value: unknown): value is LocaleCode =>
  typeof value === 'string' && DASHBOARD_LOCALES.includes(value as LocaleCode)

const normalizeLocale = (value: unknown): LocaleCode => (isLocaleCode(value) ? value : 'fr')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeTranslations = (
  translations: unknown,
  fallbackLocale: LocaleCode,
  fallbackLabel: string,
): CategoryCodeTranslationPayload[] => {
  if (Array.isArray(translations)) {
    const normalized = translations
      .filter(isRecord)
      .map((translation): CategoryCodeTranslationPayload | null => {
        if (!isLocaleCode(translation.locale) || typeof translation.label !== 'string') return null
        return { locale: translation.locale, label: translation.label }
      })
      .filter((translation): translation is CategoryCodeTranslationPayload => translation !== null)

    if (normalized.length > 0) return normalized
  }

  return [{ locale: fallbackLocale, label: fallbackLabel }]
}

const getFallbackLabel = (body: CategoryCodeCreateRequest): string => {
  const directLabel = body.label?.trim() || body.code?.trim()
  if (directLabel) return directLabel
  if (!Array.isArray(body.translations)) return ''

  const firstTranslation = body.translations.find(
    (translation): translation is { label: string } =>
      isRecord(translation) && typeof translation.label === 'string' && translation.label.trim(),
  )

  return firstTranslation?.label.trim() ?? ''
}

export default defineEventHandler(async (event): Promise<SymfonyCategoryCode> => {
  await requireUserSession(event)

  const body = await readBody<CategoryCodeCreateRequest>(event)
  const label = getFallbackLabel(body)
  if (!label || !body?.inCodeSet) {
    throw createError({ statusCode: 400, statusMessage: 'label et inCodeSet sont requis' })
  }

  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()
  const translations = normalizeTranslations(body.translations, normalizeLocale(body.locale), label)

  const created = await $fetch<SymfonyCategoryCode>(
    `${apiUrl}/api/projects/${projectId}/category-codes/translations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      },
      body: { inCodeSet: body.inCodeSet, translations },
    },
  )

  return created
})
