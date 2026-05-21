import type {
  DashboardAccommodation,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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

export async function exportToMarkdown(
  accommodation: DashboardAccommodation,
): Promise<MarkdownExportResult> {
  if (isFixture(accommodation)) {
    return { updated: false, reason: 'fixture_skipped' }
  }

  const filePath = join(
    process.cwd(),
    'content',
    accommodation.locale,
    'accommodations',
    accommodation.fileName,
  )

  const content = buildMarkdown(accommodation.frontmatter, accommodation.body)

  await writeFile(filePath, content, 'utf8')

  return { updated: true, filePath }
}
