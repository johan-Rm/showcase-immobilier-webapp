/* eslint-disable no-console */
/**
 * Synchronisation API → fichiers content (pull-only).
 *
 * Lit l'API Symfony et écrit les fichiers locaux pour toutes les locales.
 * Coexiste avec import-accommodations.ts qui fait l'inverse (push).
 *
 * Usage :
 *   bun scripts/content-sync.ts
 *   bun scripts/content-sync.ts --dry-run
 *   bun scripts/content-sync.ts --locale=fr
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

import { config as loadDotenv } from 'dotenv'
import YAML from 'yaml'

loadDotenv({ path: resolve(process.cwd(), '.env') })

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const isDryRun = process.argv.includes('--dry-run')
const localeFlag = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1]
const LOCALES = localeFlag ? [localeFlag] : ['fr', 'en', 'es']

const API_URL = process.env.SYMFONY_API_URL ?? ''
const PROJECT_ID = process.env.SYMFONY_PROJECT_ID ?? ''
const SERVICE_EMAIL = process.env.SYMFONY_SERVICE_EMAIL ?? ''
const SERVICE_PASSWORD = process.env.SYMFONY_SERVICE_PASSWORD ?? ''
const CONTENT_DIR = join(process.cwd(), 'content')

if (!API_URL || !PROJECT_ID || !SERVICE_EMAIL || !SERVICE_PASSWORD) {
  console.error('[content-sync] Erreur : variables SYMFONY_* manquantes dans .env')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Types API
// ---------------------------------------------------------------------------

type HydraCollection<TItem> = { 'hydra:member': TItem[] }

type ApiOffer = {
  price: string
  priceCurrency: string
  priceSpecification?: string | null
  availability?: string | null
}

type ApiAccommodationMedia = {
  mediaObject: string // UUID
  position: number
  caption: string | null
  keywords: string[]
}

type ApiAccommodation = {
  id: string
  identifier: string
  slug: string
  name: string | null
  label: string | null
  highlight: string | null
  body: string | null
  review: string | null
  metaTitle: string | null
  metaDescription: string | null
  locationDescription: string | null
  category: string
  realEstateListing: string
  place: string
  amenityFeature: string[]
  tags: string[]
  offer: ApiOffer | null
  floorSize: string | null
  landArea: string | null
  areaSize: string | null
  areaTerrace: string | null
  level: number | null
  yearBuilt: number | null
  numberOfRooms: number | null
  numberOfBedrooms: number | null
  numberOfBathroomsTotal: number | null
  numberOfGarages: number | null
  occupancy: number | null
  associatedMedia: ApiAccommodationMedia[]
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}

type ApiCategoryCode = {
  id: string
  codeValue: string
  label: string
  inCodeSet: string
}

type ApiMediaObject = {
  id: string
  caption: string | null
  contentUrl: string | null
  originalFilename: string | null
  mainEntity: string | null
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function fetchToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SERVICE_EMAIL, password: SERVICE_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { token: string }
  return json.token
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/ld+json' }
}

async function fetchCollection<TItem>(url: string, token: string): Promise<TItem[]> {
  const res = await fetch(url, { headers: authHeaders(token) })
  if (!res.ok) throw new Error(`Fetch failed [${res.status}] ${url}`)
  const json = (await res.json()) as HydraCollection<TItem>
  return json['hydra:member'] ?? []
}

function projectUrl(path: string, locale: string) {
  return `${API_URL}/api/projects/${PROJECT_ID}/${path}?pagination=false&locale=${locale}`
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

type CategoryCodeYamlItem = { codeValue: string; name: string; inCodeSet: string }

function mapCategoryCodes(items: ApiCategoryCode[]): CategoryCodeYamlItem[] {
  return items
    .filter((item) => Boolean(item.codeValue && item.inCodeSet))
    .map((item) => ({
      codeValue: item.codeValue,
      name: item.label ?? item.codeValue,
      inCodeSet: item.inCodeSet,
    }))
    .sort((a, b) => a.inCodeSet.localeCompare(b.inCodeSet) || a.codeValue.localeCompare(b.codeValue))
}

type MediaObjectYamlItem = { identifier: string; caption: string; url: string; mainEntity: string }
type UuidFilenameMap = Record<string, string>

function mapMediaObjects(items: ApiMediaObject[]): {
  yamlItems: MediaObjectYamlItem[]
  uuidToFilename: UuidFilenameMap
} {
  const yamlItems: MediaObjectYamlItem[] = []
  const uuidToFilename: UuidFilenameMap = {}

  for (const item of items) {
    if (!item.id || !item.contentUrl) continue

    const filename = item.originalFilename
      ? item.originalFilename.replace(/\.[^.]+$/, '')
      : item.id

    uuidToFilename[item.id] = filename
    yamlItems.push({
      identifier: item.id,
      caption: item.caption ?? '',
      url: item.contentUrl,
      mainEntity: item.mainEntity ?? 'ImageObject',
    })
  }

  return { yamlItems, uuidToFilename }
}

function toNumericIfPossible(v: string | null | undefined): number | string | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) && v.trim() !== '' ? n : v
}

type AccommodationFrontmatter = Record<string, unknown>

function mapAccommodation(
  item: ApiAccommodation,
  uuidToFilename: UuidFilenameMap,
): { frontmatter: AccommodationFrontmatter; body: string } {
  const fm: AccommodationFrontmatter = {}

  fm.identifier = item.identifier
  if (item.name) fm.name = item.name
  fm.dateCreated = item.createdAt
  fm.dateModified = item.updatedAt

  if (item.category) fm.category = item.category
  if (item.realEstateListing) fm.realEstateListing = item.realEstateListing
  if (item.place) fm.place = item.place

  if (item.offer) {
    fm.offer = {
      price: toNumericIfPossible(item.offer.price) ?? item.offer.price,
      priceCurrency: item.offer.priceCurrency,
      ...(item.offer.priceSpecification && { priceSpecification: item.offer.priceSpecification }),
      ...(item.offer.availability && { availability: item.offer.availability }),
    }
  }

  if (item.yearBuilt != null) fm.yearBuilt = item.yearBuilt
  if (item.floorSize != null) fm.floorSize = toNumericIfPossible(item.floorSize) ?? item.floorSize
  if (item.landArea != null) fm.landArea = toNumericIfPossible(item.landArea) ?? item.landArea
  if (item.areaSize != null) fm.areaSize = item.areaSize
  if (item.areaTerrace != null) fm.areaTerrace = item.areaTerrace
  if (item.level != null) fm.level = item.level
  if (item.numberOfRooms != null) fm.numberOfRooms = item.numberOfRooms
  if (item.numberOfBedrooms != null) fm.numberOfBedrooms = item.numberOfBedrooms
  if (item.numberOfBathroomsTotal != null) fm.numberOfBathroomsTotal = item.numberOfBathroomsTotal
  if (item.numberOfGarages != null) fm.numberOfGarages = item.numberOfGarages
  if (item.occupancy != null) fm.occupancy = item.occupancy

  if (item.amenityFeature?.length) fm.amenityFeature = item.amenityFeature
  if (item.tags?.length) fm.tags = item.tags

  const sortedMedia = [...item.associatedMedia].sort((a, b) => a.position - b.position)
  const resolvedMedia: Array<{ image: string; caption?: string; keywords?: string[] }> = []
  for (const entry of sortedMedia) {
    const filename = uuidToFilename[entry.mediaObject]
    if (!filename) {
      console.warn(`    [warn] mediaObject UUID non résolu : ${entry.mediaObject}`)
      continue
    }
    resolvedMedia.push({
      image: filename,
      ...(entry.caption && { caption: entry.caption }),
      ...(entry.keywords?.length && { keywords: entry.keywords }),
    })
  }
  fm.associatedMedia = resolvedMedia

  fm.isActive = item.status === 'published'

  if (item.label) fm.label = item.label
  if (item.highlight) fm.highlight = item.highlight
  if (item.review) fm.review = item.review
  if (item.locationDescription) fm.locationDescription = item.locationDescription
  if (item.metaTitle) fm.metaTitle = item.metaTitle
  if (item.metaDescription) fm.metaDescription = item.metaDescription

  return {
    frontmatter: fm,
    body: item.body?.trim() ?? '',
  }
}

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

function toMarkdown(frontmatter: AccommodationFrontmatter, body: string): string {
  const yaml = YAML.stringify(frontmatter, { lineWidth: 0 })
  return body ? `---\n${yaml}---\n\n${body}\n` : `---\n${yaml}---\n`
}

function toYaml(items: unknown[]): string {
  return YAML.stringify({ items }, { lineWidth: 0 })
}

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

async function safeWriteFile(filePath: string, content: string) {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

// ---------------------------------------------------------------------------
// Sync par locale
// ---------------------------------------------------------------------------

async function syncLocale(locale: string, token: string) {
  console.log(`\n[sync:${locale}]`)

  const [categoryCodes, mediaObjects, accommodations] = await Promise.all([
    fetchCollection<ApiCategoryCode>(projectUrl('category-codes', locale), token),
    fetchCollection<ApiMediaObject>(projectUrl('media-objects', locale), token),
    fetchCollection<ApiAccommodation>(projectUrl('accommodations', locale), token),
  ])

  console.log(
    `  category-codes: ${categoryCodes.length}, media-objects: ${mediaObjects.length}, accommodations: ${accommodations.length}`,
  )

  if (accommodations.length === 0) {
    console.warn(`  [warn] Aucune accommodation — vérifier SYMFONY_PROJECT_ID`)
  }

  // Category codes
  const mappedCodes = mapCategoryCodes(categoryCodes)
  const codeYamlPath = join(CONTENT_DIR, locale, 'metadata', 'category-code.yaml')
  if (isDryRun) {
    console.log(`  [dry-run] ${codeYamlPath} (${mappedCodes.length} codes)`)
  } else {
    await safeWriteFile(codeYamlPath, toYaml(mappedCodes))
    console.log(`  ✓ category-code.yaml (${mappedCodes.length})`)
  }

  // Media objects
  const { yamlItems: mediaYaml, uuidToFilename } = mapMediaObjects(mediaObjects)
  const mediaYamlPath = join(CONTENT_DIR, locale, 'metadata', 'media-object.yaml')
  if (isDryRun) {
    console.log(`  [dry-run] ${mediaYamlPath} (${mediaYaml.length} items)`)
  } else {
    await safeWriteFile(mediaYamlPath, toYaml(mediaYaml))
    console.log(`  ✓ media-object.yaml (${mediaYaml.length})`)
  }

  // Accommodations
  let ok = 0
  let errors = 0
  for (const item of accommodations) {
    const filename = `${item.slug || item.identifier.toLowerCase()}.md`
    const filePath = join(CONTENT_DIR, locale, 'accommodations', filename)
    try {
      const { frontmatter, body } = mapAccommodation(item, uuidToFilename)
      if (isDryRun) {
        console.log(`  [dry-run] ${filePath}`)
      } else {
        await safeWriteFile(filePath, toMarkdown(frontmatter, body))
        console.log(`  ✓ ${filename}`)
      }
      ok++
    } catch (err) {
      console.error(`  ✗ ${filename}: ${err}`)
      errors++
    }
  }

  return { ok, errors }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`[content-sync] mode=${isDryRun ? 'dry-run' : 'live'} locales=${LOCALES.join(',')}`)

  const token = await fetchToken()
  console.log('[content-sync] authentifié ✓')

  let totalOk = 0
  let totalErrors = 0

  for (const locale of LOCALES) {
    const { ok, errors } = await syncLocale(locale, token)
    totalOk += ok
    totalErrors += errors
  }

  console.log(`\n[content-sync] terminé — accommodations: ${totalOk}, erreurs: ${totalErrors}`)

  if (totalErrors > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[content-sync] erreur fatale:', err)
  process.exit(1)
})
