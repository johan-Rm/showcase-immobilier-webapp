import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

import { loadDashboardAccommodations } from '../../../utils/dashboard/accommodations'

const DEFAULT_LOCALE = 'fr'

export default defineEventHandler(async (event): Promise<DashboardAccommodation> => {
  await requireUserSession(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing accommodation slug',
    })
  }

  const query = getQuery(event)
  const locale =
    typeof query.locale === 'string' && query.locale.length > 0 ? query.locale : DEFAULT_LOCALE
  const response = await loadDashboardAccommodations(locale)
  const accommodation = response.items.find((item) => item.slug === slug)

  if (!accommodation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Accommodation not found',
    })
  }

  return accommodation
})
