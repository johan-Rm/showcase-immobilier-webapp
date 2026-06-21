import type {
  DashboardAccommodationResolvedIris,
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

import { loadContentFromFiles } from '../content/loaders'

type ContentCategoryCode = {
  id?: unknown
  codeValue?: unknown
  inCodeSet?: unknown
}

const getStringArray = (value: DashboardEditableValue | undefined): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const getString = (value: DashboardEditableValue | undefined): string | null =>
  typeof value === 'string' && value ? value : null

const getCategoryCodeId = (item: ContentCategoryCode): string | null =>
  typeof item.id === 'string' && item.id ? item.id : null

export const resolveCategoryCodeIris = async (input: {
  locale: string
  frontmatter: DashboardEditableRecord
  apiUrl: string
  projectId: string
}): Promise<DashboardAccommodationResolvedIris> => {
  const items = await loadContentFromFiles<ContentCategoryCode[]>('category-code', input.locale)
  const idByCodeSetAndValue = new Map<string, string>()

  for (const item of items) {
    if (typeof item.inCodeSet !== 'string' || typeof item.codeValue !== 'string') continue
    const id = getCategoryCodeId(item)
    if (!id) continue
    idByCodeSetAndValue.set(`${item.inCodeSet}:${item.codeValue}`, id)
  }

  const resolve = (inCodeSet: string, codeValue: string | null): string | null => {
    if (!codeValue) return null
    const id = idByCodeSetAndValue.get(`${inCodeSet}:${codeValue}`)
    if (!id) throw new Error(`CategoryCode ${inCodeSet}/${codeValue} absent de content`)
    return `${input.apiUrl}/api/projects/${input.projectId}/category-codes/${id}`
  }

  const resolveMany = (inCodeSet: string, codeValues: string[]): string[] =>
    codeValues.map((codeValue) => {
      const iri = resolve(inCodeSet, codeValue)
      if (!iri) throw new Error(`CategoryCode ${inCodeSet}/${codeValue} invalide`)
      return iri
    })

  return {
    category: resolve('accommodation-type', getString(input.frontmatter.category)),
    realEstateListing: resolve(
      'real-estate-listing',
      getString(input.frontmatter.realEstateListing),
    ),
    place: resolve('accommodation-place', getString(input.frontmatter.place)),
    amenityFeature: resolveMany(
      'amenity-feature',
      getStringArray(input.frontmatter.amenityFeature),
    ),
    tags: resolveMany('tag', getStringArray(input.frontmatter.tags)),
  }
}
