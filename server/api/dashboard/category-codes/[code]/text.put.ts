import type { LocaleCode } from '#shared/types/i18n'

import { getSymfonyServiceToken } from '../../../../utils/dashboard/symfonyAuth'
import { getProjectLocales } from '../../../../utils/projectLocales'

type SymfonyCategoryCodeTranslationPayload = {
  locale: LocaleCode
  text: string
}

type UpdatePlaceTextBody = {
  locale?: unknown
  text?: unknown
  uuid?: unknown
}

type UpdatePlaceTextResponse = {
  codeValue: string
  name: string
  inCodeSet: 'accommodation-place'
  text: string
}

const DASHBOARD_LOCALES: LocaleCode[] = ['fr', 'en', 'es']
const PLACE_CODE_SET = 'accommodation-place'

const isLocaleCode = (value: unknown): value is LocaleCode =>
  typeof value === 'string' && DASHBOARD_LOCALES.includes(value as LocaleCode)

const isCategoryCodeUuid = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const getApiBase = (): { apiUrl: string; projectId: string } => {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

const isDebugEnabled = (): boolean => process.env.DASHBOARD_SAVE_DEBUG === '1'

const debugPlaceTextSave = (label: string, data: Record<string, unknown>): void => {
  if (!isDebugEnabled()) return
  console.warn(`[dashboard-place-text] ${label}`, JSON.stringify(data, null, 2))
}

export default defineEventHandler(async (event): Promise<UpdatePlaceTextResponse> => {
  await requireUserSession(event)

  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Code lieu manquant' })
  }

  const body = await readBody<UpdatePlaceTextBody>(event)
  if (!isLocaleCode(body.locale)) {
    throw createError({ statusCode: 400, statusMessage: 'Locale invalide' })
  }
  if (!isCategoryCodeUuid(body.uuid)) {
    throw createError({ statusCode: 400, statusMessage: 'UUID category-code invalide' })
  }
  if (typeof body.text !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Texte du lieu invalide' })
  }

  const { enabledLocales } = await getProjectLocales()
  if (!enabledLocales.includes(body.locale)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Locale ${body.locale} non activée pour ce projet`,
    })
  }

  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const text = body.text.trim()
  const translation: SymfonyCategoryCodeTranslationPayload = {
    locale: body.locale,
    text,
  }
  const symfonyUrl = `${apiUrl}/api/projects/${projectId}/category-codes/${body.uuid}/translations`

  debugPlaceTextSave('request', {
    url: symfonyUrl,
    locale: body.locale,
    inCodeSet: PLACE_CODE_SET,
    code,
    uuid: body.uuid,
    textLength: text.length,
  })

  await $fetch(symfonyUrl, {
    method: 'PUT',
    headers,
    query: { locale: body.locale },
    body: {
      inCodeSet: PLACE_CODE_SET,
      translations: [translation],
    },
  })

  return {
    codeValue: code,
    name: code,
    inCodeSet: PLACE_CODE_SET,
    text,
  }
})
