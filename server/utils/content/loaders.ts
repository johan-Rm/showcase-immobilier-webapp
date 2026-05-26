import type { ResourceKey } from '#shared/types/content'
import type { LocaleCode } from '#shared/types/i18n'
import type { WebPageDto } from '@schemas/dtos'

import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import YAML from 'yaml'

import { normalizeLocale } from '#shared/utils/locale'

const FRONTMATTER_REGEX = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/
const TRUTHY_ENV_VALUES = new Set(['1', 'true', 'yes', 'on'])
const FIXTURE_DATA_SOURCE_PROPERTY = 'dataSource'
const FIXTURE_DATA_SOURCE_VALUE = 'fixture'

const YAML_FILE_BY_RESOURCE: Partial<Record<ResourceKey, string>> = {
  app: 'ui/app.yaml',
  'real-estate-listing': 'metadata/real-estate-listing.yaml',
  'accommodation-category': 'metadata/accommodation-category.yaml',
  'category-code': 'metadata/category-code.yaml',
  'accommodation-place': 'metadata/accommodation-place.yaml',
  'media-object': 'metadata/media-object.yaml',
  'forms/accommodation': 'ui/forms/accommodation.yaml',
  dashboard: 'ui/dashboard.yaml',
  'ui/accommodation': 'ui/accommodation.yaml',
}

const YAML_OBJECT_RESOURCES = new Set<ResourceKey>([
  'app',
  'forms/accommodation',
  'dashboard',
  'ui/accommodation',
])

const MARKDOWN_DIR_BY_RESOURCE: Partial<Record<ResourceKey, string>> = {
  'web-pages': 'web-pages',
  accommodations: 'accommodations',
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const normalizeEnvFlag = (value: string | undefined): boolean => {
  return TRUTHY_ENV_VALUES.has(value?.trim().toLowerCase() ?? '')
}

const areAccommodationFixturesEnabled = (): boolean => {
  return (
    normalizeEnvFlag(process.env.ACCOMMODATION_FIXTURES_ENABLED) ||
    normalizeEnvFlag(process.env.NUXT_ACCOMMODATION_FIXTURES_ENABLED)
  )
}

const isFixtureAccommodation = (frontmatter: Record<string, unknown>): boolean => {
  const additionalProperties = frontmatter.additionalProperty
  if (!Array.isArray(additionalProperties)) return false

  return additionalProperties.some((property) => {
    if (!isRecord(property)) return false

    const name = typeof property.name === 'string' ? property.name.trim() : ''
    const value = typeof property.value === 'string' ? property.value.trim() : ''

    return name === FIXTURE_DATA_SOURCE_PROPERTY && value === FIXTURE_DATA_SOURCE_VALUE
  })
}

const resolveContentRoot = (): string => {
  const candidates = [
    process.env.CONTENT_PATH?.trim(),
    join(process.cwd(), 'content'),
    resolve(process.cwd(), '..', 'content'),
    join(process.cwd(), '.output', 'content'),
  ].filter((value): value is string => Boolean(value))

  const match = candidates.find((dir) => existsSync(dir))

  if (!match) {
    throw new Error(
      `[content] Aucun dossier de contenu trouvé. Chemins testés: ${candidates.join(', ')}`,
    )
  }

  return match
}

const parseFrontmatter = (raw: string, source: string): Record<string, unknown> => {
  const match = raw.match(FRONTMATTER_REGEX)
  if (!match) {
    throw new Error(`Frontmatter manquant dans "${source}"`)
  }

  const content = match[1]
  if (!content) {
    throw new Error(`Frontmatter invalide dans "${source}" (contenu vide)`)
  }

  try {
    const parsed = YAML.parse(content)
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Le frontmatter doit être un objet YAML')
    }
    return parsed as Record<string, unknown>
  } catch (error) {
    throw new Error(`Frontmatter invalide dans "${source}" : ${(error as Error).message}`)
  }
}

const parseMarkdownWithFrontmatter = (
  raw: string,
  source: string,
): { frontmatter: Record<string, unknown>; body: string } => {
  const match = raw.match(FRONTMATTER_REGEX)
  if (!match) {
    return { frontmatter: {}, body: raw.trim() }
  }

  try {
    const frontmatter = parseFrontmatter(raw, source)
    const body = raw.replace(FRONTMATTER_REGEX, '').trim()
    return { frontmatter, body }
  } catch (error) {
    if (import.meta.dev) {
      console.warn(
        `[content] Invalid frontmatter in "${source}", falling back to empty frontmatter:`,
        error,
      )
    }
    const body = raw.replace(FRONTMATTER_REGEX, '').trim()
    return { frontmatter: {}, body }
  }
}

const extractYamlItems = <T>(data: unknown, source: string): T[] => {
  if (Array.isArray(data)) {
    return data as T[]
  }
  if (data && typeof data === 'object' && 'items' in data) {
    const items = (data as { items?: unknown }).items
    if (Array.isArray(items)) {
      return items as T[]
    }
  }
  throw new Error(`Invalid YAML list in "${source}" (expected array or { items: [] })`)
}

const extractYamlObject = <T>(data: unknown, source: string): T => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as T
  }
  throw new Error(`Invalid YAML object in "${source}" (expected object)`)
}

const loadYamlResource = async <T>(resource: ResourceKey, locale: LocaleCode): Promise<T> => {
  const fileName = YAML_FILE_BY_RESOURCE[resource]
  if (!fileName) {
    throw new Error(`Unsupported YAML resource "${resource}"`)
  }

  const contentRoot = resolveContentRoot()
  const filePath = join(contentRoot, locale, fileName)
  const raw = await readFile(filePath, 'utf8')
  const parsed = YAML.parse(raw)

  if (YAML_OBJECT_RESOURCES.has(resource)) {
    return extractYamlObject<T>(parsed, filePath)
  }

  return extractYamlItems<T>(parsed, filePath) as T
}

const loadWebPagesResource = async <T>(locale: LocaleCode): Promise<T> => {
  const contentRoot = resolveContentRoot()
  const directory = join(contentRoot, locale, 'web-pages')
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right))

  const pages = await Promise.all(
    files.map(async (fileName) => {
      const filePath = join(directory, fileName)
      const raw = await readFile(filePath, 'utf8')
      const { frontmatter, body } = parseMarkdownWithFrontmatter(raw, filePath)
      const slug =
        typeof frontmatter.slug === 'string' ? frontmatter.slug : fileName.replace(/\.md$/, '')

      return {
        ...frontmatter,
        slug,
        body,
      } satisfies WebPageDto
    }),
  )

  return pages as T
}

type AccommodationPlaceItem = { slug: string; name: string; description?: string }

const loadAccommodationsResource = async <T>(locale: LocaleCode): Promise<T> => {
  const contentRoot = resolveContentRoot()
  const directory = join(contentRoot, locale, 'accommodations')
  const includeFixtures = areAccommodationFixturesEnabled()
  const placeFilePath = join(contentRoot, locale, 'metadata/accommodation-place.yaml')

  const [dirFiles, placeRaw] = await Promise.all([
    readdir(directory),
    readFile(placeFilePath, 'utf8'),
  ])

  const placeItems = extractYamlItems<AccommodationPlaceItem>(YAML.parse(placeRaw), placeFilePath)
  const placeBySlug = new Map(placeItems.map((item) => [item.slug, item]))

  const files = dirFiles
    .filter((file) => file.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right))

  const accommodations = await Promise.all(
    files.map(async (fileName) => {
      const filePath = join(directory, fileName)
      const raw = await readFile(filePath, 'utf8')
      const { frontmatter, body } = parseMarkdownWithFrontmatter(raw, filePath)
      if (!includeFixtures && isFixtureAccommodation(frontmatter)) {
        return null
      }

      const placeSlug = typeof frontmatter.place === 'string' ? frontmatter.place : null
      const place = placeSlug
        ? (placeBySlug.get(placeSlug) ?? { slug: placeSlug, name: placeSlug })
        : frontmatter.place

      return {
        ...frontmatter,
        place,
        body,
      }
    }),
  )

  return accommodations.filter((item): item is NonNullable<typeof item> => item !== null) as T
}

export const loadContentFromFiles = async <T>(
  resource: ResourceKey,
  locale: string,
): Promise<T> => {
  const normalizedLocale = normalizeLocale(locale)

  if (resource in MARKDOWN_DIR_BY_RESOURCE) {
    if (resource === 'web-pages') {
      return loadWebPagesResource<T>(normalizedLocale)
    }
    if (resource === 'accommodations') {
      return loadAccommodationsResource<T>(normalizedLocale)
    }
  }

  return loadYamlResource<T>(resource, normalizedLocale)
}
