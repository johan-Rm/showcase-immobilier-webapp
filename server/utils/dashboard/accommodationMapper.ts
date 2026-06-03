import { isLocaleCode } from '#shared/i18n/config'
import {
  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS,
  type DashboardAccommodationSavePayload,
  type DashboardAccommodationTranslationPayload,
  type DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

// ---------------------------------------------------------------------------
// Types helpers
// ---------------------------------------------------------------------------

export type SymfonyAccommodationPayload = Record<string, unknown>

// ---------------------------------------------------------------------------
// Value extractors
// ---------------------------------------------------------------------------

function isRecord(
  v: DashboardEditableValue | undefined,
): v is Record<string, DashboardEditableValue> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asString(v: DashboardEditableValue | undefined): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function asPayloadString(v: DashboardEditableValue | undefined): string | null {
  if (typeof v === 'number') return String(v)
  return asString(v)
}

function asNumber(v: DashboardEditableValue | undefined): number | null {
  return typeof v === 'number' ? v : null
}

function asBoolean(v: DashboardEditableValue | undefined): boolean | null {
  return typeof v === 'boolean' ? v : null
}

function mapAssociatedMedia(
  value: DashboardEditableValue | undefined,
  mediaObjectIriBase: string,
): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      if (!isRecord(item)) return null
      const uuid = asString(item.image)
      if (!uuid) return null

      return {
        mediaObject: `${mediaObjectIriBase}/${uuid}`,
        position: index + 1,
        caption: asString(item.caption),
        keywords: Array.isArray(item.keywords)
          ? item.keywords.filter((k): k is string => typeof k === 'string')
          : [],
        representativeOfPage: asBoolean(item.representativeOfPage),
      }
    })
    .filter((item): item is Record<string, unknown> => item !== null)
}

function hasUsableTranslation(
  translation: DashboardAccommodationTranslationPayload,
): translation is DashboardAccommodationTranslationPayload {
  return DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.some((field) => Object.hasOwn(translation, field))
}

function normalizeTranslations(
  translations: DashboardAccommodationSavePayload['translations'],
): DashboardAccommodationTranslationPayload[] {
  if (!Array.isArray(translations)) return []

  return translations
    .map((translation) => {
      const normalized: DashboardAccommodationTranslationPayload = {
        locale: translation.locale,
      }

      DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.forEach((field) => {
        if (!Object.hasOwn(translation, field)) return
        const value = translation[field]
        normalized[field] = typeof value === 'string' ? value : null
      })

      return normalized
    })
    .filter(hasUsableTranslation)
}

function createCurrentLocaleTranslation(
  accommodation: DashboardAccommodationSavePayload,
): DashboardAccommodationTranslationPayload {
  const fm = accommodation.frontmatter
  const locale = isLocaleCode(accommodation.locale) ? accommodation.locale : 'fr'
  const translation: DashboardAccommodationTranslationPayload = {
    locale,
    slug: asString(fm.slug) ?? accommodation.slug,
    name: asString(fm.name),
    label: asString(fm.label),
    highlight: asString(fm.highlight),
    body: accommodation.body || null,
    review: asString(fm.review),
    metaTitle: asString(fm.metaTitle),
    metaDescription: asString(fm.metaDescription),
  }

  return translation
}

// ---------------------------------------------------------------------------
// Mapper principal
// ---------------------------------------------------------------------------

export async function mapToApiPlatform(
  accommodation: DashboardAccommodationSavePayload,
  context: { apiUrl: string; projectId: string },
): Promise<SymfonyAccommodationPayload> {
  const fm = accommodation.frontmatter
  const normalizedTranslations = normalizeTranslations(accommodation.translations)
  const translations =
    normalizedTranslations.length > 0
      ? normalizedTranslations
      : [createCurrentLocaleTranslation(accommodation)]

  // -- Champs scalaires directs -------------------------------------------
  const identifier = accommodation.identifier
  const isActive = asBoolean(fm.isActive) ?? true
  const yearBuilt = asNumber(fm.yearBuilt)
  const areaSize = asPayloadString(fm.areaSize)
  const areaTerrace = asPayloadString(fm.areaTerrace)
  const numberOfRooms = asNumber(fm.numberOfRooms)
  const numberOfBedrooms = asNumber(fm.numberOfBedrooms)
  const numberOfBathroomsTotal = asNumber(fm.numberOfBathroomsTotal)
  const numberOfGarages = asNumber(fm.numberOfGarages)
  const occupancy = asNumber(fm.occupancy)

  const floorSize = asPayloadString(fm.floorSize)
  const landArea = asPayloadString(fm.landArea)

  // -- Offre ---------------------------------------------------------------
  const offer = isRecord(fm.offer) ? fm.offer : null
  const offerPrice = offer
    ? asNumber(offer.price) !== null
      ? String(asNumber(offer.price))
      : asString(offer.price)
    : null
  const offerPriceCurrency = offer ? asString(offer.priceCurrency) : null
  const offerPriceSpecification = offer ? asString(offer.priceSpecification) : null
  const offerAvailability = asString(fm.offerAvailability)
  const offerPayload =
    offerPrice !== null || offerPriceCurrency !== null || offerPriceSpecification !== null
      ? {
          ...(offerPrice !== null && { price: offerPrice }),
          ...(offerPriceCurrency !== null && { priceCurrency: offerPriceCurrency }),
          ...(offerPriceSpecification !== null && { priceSpecification: offerPriceSpecification }),
        }
      : null

  // -- CategoryCode IRIs (résolus côté client, transmis dans le payload) ----
  const iris = accommodation.resolvedIris
  if (!iris) {
    throw new Error('resolvedIris manquant dans le payload')
  }

  const category = iris.category
  const realEstateListing = iris.realEstateListing
  const place = iris.place
  const amenityFeature = iris.amenityFeature
  const tags = iris.tags

  const mediaObjectIriBase = `${context.apiUrl}/api/projects/${context.projectId}/media-objects`
  const associatedMedia = mapAssociatedMedia(fm.associatedMedia, mediaObjectIriBase)

  // -- Payload final -------------------------------------------------------
  const payload: SymfonyAccommodationPayload = {
    identifier,
    isActive,
    ...(category && { category }),
    ...(realEstateListing && { realEstateListing }),
    ...(place && { place }),
    amenityFeature,
    tags,
    associatedMedia,
    ...(yearBuilt !== null && { yearBuilt }),
    ...(areaSize !== null && { areaSize }),
    ...(areaTerrace !== null && { areaTerrace }),
    ...(floorSize !== null && { floorSize }),
    ...(landArea !== null && { landArea }),
    ...(numberOfRooms !== null && { numberOfRooms }),
    ...(numberOfBedrooms !== null && { numberOfBedrooms }),
    ...(numberOfBathroomsTotal !== null && { numberOfBathroomsTotal }),
    ...(numberOfGarages !== null && { numberOfGarages }),
    ...(occupancy !== null && { occupancy }),
    ...(offerPayload !== null && { offer: offerPayload }),
    ...(offerAvailability !== null && { offerAvailability }),
    translations,
  }

  return payload
}
