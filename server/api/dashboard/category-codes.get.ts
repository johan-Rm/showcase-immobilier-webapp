import { getCategoryCodeMap } from '../../utils/dashboard/symfonyCache'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return getCategoryCodeMap()
})
