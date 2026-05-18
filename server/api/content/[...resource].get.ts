import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'

import { loadContentFromFiles } from '../../utils/content/loaders'

import { isResourceKey } from '#shared/content/config'

export default defineEventHandler(async (event) => {
  const resourceParam = getRouterParam(event, 'resource')
  if (!resourceParam || !isResourceKey(resourceParam)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported content resource "${resourceParam ?? 'unknown'}"`,
    })
  }

  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : 'fr'

  return loadContentFromFiles(resourceParam, locale)
})
