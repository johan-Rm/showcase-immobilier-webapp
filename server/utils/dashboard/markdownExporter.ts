import type {
  DashboardAccommodation,
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

import { readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

import YAML from 'yaml'

function isFixture(accommodation: DashboardAccommodation): boolean {
  const additionalProperty = accommodation.frontmatter.additionalProperty
  if (!Array.isArray(additionalProperty)) return false
  return additionalProperty.some((prop) => {
    if (typeof prop !== 'object' || prop === null || Array.isArray(prop)) return false
    const entry = prop as Record<string, DashboardEditableValue>
    return entry.name === 'dataSource' && entry.value === 'fixture'
  })
}

function buildMarkdown(frontmatter: Record<string, DashboardEditableValue>, body: string): string {
  const yaml = YAML.stringify(frontmatter)
  const trimmedBody = body.trimStart()
  return `---\n${yaml}---\n\n${trimmedBody}\n`
}

export type MarkdownExportResult =
  | { updated: true; filePath: string }
  | { updated: false; reason: string }

export const resolveContentRoot = (): string => {
  const configuredPath = process.env.CONTENT_PATH?.trim()
  if (!configuredPath) return join(process.cwd(), 'content')
  return isAbsolute(configuredPath) ? configuredPath : join(process.cwd(), configuredPath)
}

export async function exportToMarkdown(
  accommodation: DashboardAccommodation,
): Promise<MarkdownExportResult> {
  if (isFixture(accommodation)) {
    return { updated: false, reason: 'fixture_skipped' }
  }

  const slug =
    typeof accommodation.frontmatter.slug === 'string' && accommodation.frontmatter.slug
      ? accommodation.frontmatter.slug
      : accommodation.identifier.toLowerCase()
  const fileName = `${slug}.md`
  const filePath = join(resolveContentRoot(), accommodation.locale, 'accommodations', fileName)

  const content = buildMarkdown(accommodation.frontmatter, accommodation.body)

  await writeFile(filePath, content, 'utf8')

  return { updated: true, filePath }
}

const LOCALIZED_FIELDS = new Set([
  'slug',
  'name',
  'label',
  'highlight',
  'body',
  'review',
  'metaTitle',
  'metaDescription',
])

const FRONTMATTER_REGEX = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/

const parseFrontmatterAndBody = (
  raw: string,
): { frontmatter: DashboardEditableRecord; body: string } | null => {
  const match = FRONTMATTER_REGEX.exec(raw)
  if (!match?.[1]) return null
  try {
    const frontmatter = YAML.parse(match[1]) as DashboardEditableRecord
    const body = raw.replace(FRONTMATTER_REGEX, '').trim()
    return { frontmatter, body }
  } catch {
    return null
  }
}

const mergeGlobalFields = (
  existing: DashboardEditableRecord,
  source: DashboardEditableRecord,
): DashboardEditableRecord => {
  const merged: DashboardEditableRecord = { ...existing }
  for (const [key, value] of Object.entries(source)) {
    if (!LOCALIZED_FIELDS.has(key)) merged[key] = value
  }
  return merged
}

const updateLocaleFile = async (
  filePath: string,
  globalFrontmatter: DashboardEditableRecord,
  identifier: string,
): Promise<boolean> => {
  let raw: string
  try {
    raw = await readFile(filePath, 'utf8')
  } catch {
    return false
  }
  const parsed = parseFrontmatterAndBody(raw)
  if (parsed?.frontmatter.identifier !== identifier) return false

  const merged = mergeGlobalFields(parsed.frontmatter, globalFrontmatter)
  await writeFile(filePath, buildMarkdown(merged, parsed.body), 'utf8')
  return true
}

export async function propagateGlobalFields(
  globalFrontmatter: DashboardEditableRecord,
  identifier: string,
  sourceLocale: string,
  otherLocales: string[],
): Promise<void> {
  const contentRoot = resolveContentRoot()

  for (const locale of otherLocales) {
    if (locale === sourceLocale) continue

    const dir = join(contentRoot, locale, 'accommodations')
    let files: string[]
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.md'))
    } catch {
      continue
    }

    for (const fileName of files) {
      const updated = await updateLocaleFile(join(dir, fileName), globalFrontmatter, identifier)
      if (updated) break
    }
  }
}

export async function deleteOrphanFile(
  oldFileName: string,
  newFilePath: string,
  locale: string,
): Promise<void> {
  const oldFilePath = join(resolveContentRoot(), locale, 'accommodations', oldFileName)
  if (oldFilePath === newFilePath) return
  try {
    await unlink(oldFilePath)
  } catch {
    // Fichier déjà absent ou non accessible — non bloquant
  }
}
