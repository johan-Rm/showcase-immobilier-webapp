import type { CategoryCodeMap } from './symfonyCache'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import YAML from 'yaml'

import {
  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS,
  type DashboardAccommodationSavePayload,
  type DashboardAccommodationTranslationPayload,
  type DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

// ---------------------------------------------------------------------------
// Types helpers
// ---------------------------------------------------------------------------

type PersonEntry = {
  identifier: string
  name?: string
  phone?: string
  email?: string
}

type PersonYaml = { items: PersonEntry[] }

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

function asStringArray(v: DashboardEditableValue | undefined): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((item): item is string => typeof item === 'string')
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
// IRI resolution
// ---------------------------------------------------------------------------

function resolveIri(
  codeMap: CategoryCodeMap,
  inCodeSet: string,
  code: string | null,
): string | null {
  if (!code) return null
  const iri = codeMap[inCodeSet]?.[code] ?? null
  if (!iri) {
    throw new Error(
      `CategoryCode introuvable : inCodeSet="${inCodeSet}" code="${code}". ` +
        `Invalider le cache Symfony si le code vient d'être créé.`,
    )
  }
  return iri
}

function resolveIriArray(codeMap: CategoryCodeMap, inCodeSet: string, codes: string[]): string[] {
  return codes
    .map((code) => resolveIri(codeMap, inCodeSet, code))
    .filter((iri): iri is string => iri !== null)
}

// ---------------------------------------------------------------------------
// person.yaml loader (lecture fichier, cache local)
// ---------------------------------------------------------------------------

let personCache: PersonEntry[] | null = null

async function loadPersons(): Promise<PersonEntry[]> {
  if (personCache) return personCache
  const path = join(process.cwd(), 'content', 'fr', 'person.yaml')
  const raw = await readFile(path, 'utf8')
  const parsed = YAML.parse(raw) as PersonYaml
  personCache = parsed.items ?? []
  return personCache
}

// ---------------------------------------------------------------------------
// Mapper principal
// ---------------------------------------------------------------------------

export async function mapToApiPlatform(
  accommodation: DashboardAccommodationSavePayload,
  locale: string,
  codeMap: CategoryCodeMap,
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

  // floorSize et landArea : number dans Markdown, string dans Symfony
  const floorSizeRaw = asNumber(fm.floorSize)
  const landAreaRaw = asNumber(fm.landArea)
  const floorSize = floorSizeRaw !== null ? String(floorSizeRaw) : null
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

  // -- CategoryCode IRIs ---------------------------------------------------
  const category = resolveIri(codeMap, 'accommodation-type', asString(fm.category))
  const realEstateListing = resolveIri(
    codeMap,
    'real-estate-listing',
    asString(fm.realEstateListing),
  )
  const place = resolveIri(codeMap, 'accommodation-place', asString(fm.place))

  // amenityFeature : filtrer les entrées non-string (bug bavr001 avec "image: uuid")
  const amenityFeatureCodes = asStringArray(fm.amenityFeature)
  const amenityFeature = resolveIriArray(codeMap, 'amenity-feature', amenityFeatureCodes)

  const tagCodes = asStringArray(fm.tags)
  const tags = resolveIriArray(codeMap, 'tag', tagCodes)

  // -- Agent immobilier (lookup person.yaml) -------------------------------
  const agentUuid = asString(fm.realEstateAgent)
  let realEstateAgentIdentifier: string | null = null
  let realEstateAgentName: string | null = null
  let realEstateAgentPhone: string | null = null
  let realEstateAgentEmail: string | null = null

  if (agentUuid) {
    const persons = await loadPersons()
    const agent = persons.find((p) => p.identifier === agentUuid) ?? null
    if (agent) {
      realEstateAgentIdentifier = agent.identifier
      realEstateAgentName = agent.name ?? null
      realEstateAgentPhone = agent.phone ?? null
      realEstateAgentEmail = agent.email ?? null
    }
  }

  // -- Champs translatables (envoyés dans le body, locale via query param) -
  const slug = asString(fm.slug) ?? accommodation.slug
  const name = asString(fm.name)
  const label = asString(fm.label)
  const highlight = asString(fm.highlight)
  const body = accommodation.body || null
  const review = asString(fm.review)
  const metaTitle = asString(fm.metaTitle)
  const metaDescription = asString(fm.metaDescription)
  const locationDescription = asString(fm.locationDescription)

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
    ...(realEstateAgentIdentifier !== null && { realEstateAgentIdentifier }),
    ...(realEstateAgentName !== null && { realEstateAgentName }),
    ...(realEstateAgentPhone !== null && { realEstateAgentPhone }),
    ...(realEstateAgentEmail !== null && { realEstateAgentEmail }),
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
          ...(locationDescription !== null && { locationDescription }),
        }),
  }

  return payload
}
