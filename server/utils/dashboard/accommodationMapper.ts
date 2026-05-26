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

function asNumber(v: DashboardEditableValue | undefined): number | null {
  return typeof v === 'number' ? v : null
}

function asBoolean(v: DashboardEditableValue | undefined): boolean | null {
  return typeof v === 'boolean' ? v : null
}

function hasUsableTranslation(
  translation: DashboardAccommodationTranslationPayload,
): translation is DashboardAccommodationTranslationPayload {
  return DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(translation, field),
  )
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
        if (!Object.prototype.hasOwnProperty.call(translation, field)) return
        const value = translation[field]
        normalized[field] = typeof value === 'string' ? value : null
      })

      return normalized
    })
    .filter(hasUsableTranslation)
}

// ---------------------------------------------------------------------------
// Mapper principal
// ---------------------------------------------------------------------------

export async function mapToApiPlatform(
  accommodation: DashboardAccommodationSavePayload,
): Promise<SymfonyAccommodationPayload> {
  const fm = accommodation.frontmatter
  const translations = normalizeTranslations(accommodation.translations)
  const isMultilingualSave = translations.length > 0

  // -- Champs scalaires directs -------------------------------------------
  const identifier = asString(fm.identifier) ?? accommodation.identifier
  const isActive = asBoolean(fm.isActive) ?? true
  const yearBuilt = asNumber(fm.yearBuilt)
  const areaSize = asNumber(fm.areaSize)
  const areaTerrace = asNumber(fm.areaTerrace)
  const numberOfRooms = asNumber(fm.numberOfRooms)
  const numberOfBedrooms = asNumber(fm.numberOfBedrooms)
  const numberOfBathroomsTotal = asNumber(fm.numberOfBathroomsTotal)
  const numberOfGarages = asNumber(fm.numberOfGarages)
  const occupancy = asNumber(fm.occupancy)

  // landArea reste textuel dans Symfony pour accepter les surfaces composées.
  const floorSizeRaw = asNumber(fm.floorSize)
  const landAreaRaw = asNumber(fm.landArea)
  const floorSize = floorSizeRaw
  const landArea = landAreaRaw !== null ? String(landAreaRaw) : null

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

  // -- Champs translatables (envoyés dans le body, locale via query param) -
  const slug = asString(fm.slug) ?? accommodation.slug
  const name = asString(fm.name)
  const label = asString(fm.label)
  const highlight = asString(fm.highlight)
  const body = accommodation.body || null
  const review = asString(fm.review)
  const metaTitle = asString(fm.metaTitle)
  const metaDescription = asString(fm.metaDescription)

  // -- Payload final -------------------------------------------------------
  const payload: SymfonyAccommodationPayload = {
    identifier,
    isActive,
    ...(category && { category }),
    ...(realEstateListing && { realEstateListing }),
    ...(place && { place }),
    amenityFeature,
    tags,
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
    ...(offerPrice !== null && { offerPrice }),
    ...(offerPriceCurrency !== null && { offerPriceCurrency }),
    ...(offerPriceSpecification !== null && { offerPriceSpecification }),
    ...(offerAvailability !== null && { offerAvailability }),
    ...(isMultilingualSave
      ? { translations }
      : {
          // Champs translatables mono-locale.
          slug,
          ...(name !== null && { name }),
          ...(label !== null && { label }),
          ...(highlight !== null && { highlight }),
          ...(body !== null && { body }),
          ...(review !== null && { review }),
          ...(metaTitle !== null && { metaTitle }),
          ...(metaDescription !== null && { metaDescription }),
        }),
  }

  return payload
}
