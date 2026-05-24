import type { LocaleCode } from './i18n'

export const DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS = [
  'slug',
  'name',
  'label',
  'highlight',
  'body',
  'review',
  'metaTitle',
  'metaDescription',
  'locationDescription',
] as const

export type DashboardLocalizedAccommodationField =
  (typeof DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS)[number]

export type DashboardAccommodationTranslationPayload = {
  locale: LocaleCode
} & Partial<Record<DashboardLocalizedAccommodationField, string | null>>

export type DashboardEditableValue =
  | string
  | number
  | boolean
  | null
  | DashboardEditableValue[]
  | { [key: string]: DashboardEditableValue }

export type DashboardEditableRecord = Record<string, DashboardEditableValue>

export type DashboardAccommodationMedia = {
  image: string
  imageUrl: string
  caption: string
  keywords: string[]
  representativeOfPage: boolean
}

export type DashboardAccommodationPreview = {
  identifier: string
  slug: string
  title: string
  description: string
  price: number | null
  priceCurrency: string
  priceSpecification: string
  placeSlug: string
  placeLabel: string
  categorySlug: string
  categoryLabel: string
  listingSlug: string
  listingLabel: string
  isActive: boolean
  floorSize: number | null
  landArea: number | null
  numberOfRooms: number | null
  numberOfBedrooms: number | null
  numberOfBathroomsTotal: number | null
  primaryImageUrl: string
  media: DashboardAccommodationMedia[]
}

export type DashboardAccommodation = {
  locale: string
  fileName: string
  slug: string
  identifier: string
  frontmatter: DashboardEditableRecord
  body: string
  preview: DashboardAccommodationPreview
}

export type DashboardAccommodationSavePayload = DashboardAccommodation & {
  translations?: DashboardAccommodationTranslationPayload[]
}

export type DashboardFilterOption = {
  value: string
  label: string
  count: number
}

export type DashboardAccommodationFilters = {
  listings: DashboardFilterOption[]
  categories: DashboardFilterOption[]
  places: DashboardFilterOption[]
}

export type DashboardAccommodationsResponse = {
  items: DashboardAccommodation[]
  filters: DashboardAccommodationFilters
}
