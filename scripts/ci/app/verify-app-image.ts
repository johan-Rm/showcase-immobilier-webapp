/**
 * @rule app/README.md — Convention : Images
 *
 * Vérifie que toutes les images dans app/ passent par <AppImage>
 * avec un preset via v-bind — pas de balises brutes ni de props image en dur.
 *
 * Violations détectées :
 *   1. <img>, <NuxtImg>, <NuxtPicture> en dehors de app/components/AppImage.vue
 *   2. <AppImage> avec des props image écrites en dur (:width, :format, :quality, :fit, :sizes)
 *      au lieu de v-bind="IMAGE_PRESETS.xxx" ou v-bind="IMAGE_WARMUP_PRESETS.xxx"
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const APP_DIR = join(ROOT, 'app')
const APP_IMAGE_FILE = join(ROOT, 'app', 'components', 'AppImage.vue')
const EXCLUDED = new Set(['node_modules', '.nuxt', 'dist', '.git'])

const FORBIDDEN_TAGS = ['img', 'NuxtImg', 'NuxtPicture']
const INLINE_IMAGE_PROPS = [':width=', ':height=', ':format=', ':quality=', ':fit=', ':sizes=']

export type FilePath = string
export type Violation = {
  file: FilePath
  line: number
  rule: 1 | 2
  message: string
}

export function collectVueFiles(dir: string): FilePath[] {
  const files: FilePath[] = []

  function walk(current: string): void {
    let entries: string[]
    try {
      entries = readdirSync(current)
    } catch {
      return
    }
    for (const entry of entries) {
      if (EXCLUDED.has(entry)) continue
      const full = join(current, entry)
      try {
        if (statSync(full).isDirectory()) {
          walk(full)
        } else if (extname(entry) === '.vue') {
          files.push(full)
        }
      } catch {
        /* skip unreadable */
      }
    }
  }

  walk(dir)
  return files
}

export function extractTemplate(content: string): { text: string; offset: number } | null {
  const match = content.match(/<template>([\s\S]*?)<\/template>/)
  if (!match || match.index === undefined) return null
  return {
    text: match[1],
    offset: match.index + '<template>'.length,
  }
}

export function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length
}

export function checkFile(file: FilePath): Violation[] {
  const violations: Violation[] = []

  let content: string
  try {
    content = readFileSync(file, 'utf-8')
  } catch {
    return violations
  }

  const tpl = extractTemplate(content)
  if (!tpl) return violations
  const { text: template, offset } = tpl

  // Règle 1 — balises image brutes interdites (sauf AppImage.vue qui wrap NuxtImg)
  if (file !== APP_IMAGE_FILE) {
    for (const tag of FORBIDDEN_TAGS) {
      const regex = new RegExp(`<${tag}\\b`, 'g')
      let match: RegExpExecArray | null
      while ((match = regex.exec(template)) !== null) {
        violations.push({
          file,
          line: lineAt(content, offset + match.index),
          rule: 1,
          message: `<${tag}> interdit — utiliser <AppImage> avec un preset`,
        })
      }
    }
  }

  // Règle 2 — <AppImage> avec props image écrites en dur
  const appImageRegex = /<AppImage\b([\s\S]*?)(?:\/?>)/g
  let match: RegExpExecArray | null
  while ((match = appImageRegex.exec(template)) !== null) {
    const block = match[1]
    const inlineProps = INLINE_IMAGE_PROPS.filter((prop) => block.includes(prop))
    if (inlineProps.length > 0) {
      violations.push({
        file,
        line: lineAt(content, offset + match.index),
        rule: 2,
        message: `<AppImage> avec props en dur (${inlineProps.join(', ')}) — utiliser v-bind="IMAGE_PRESETS.xxx"`,
      })
    }
  }

  return violations
}

function rel(file: FilePath): string {
  return relative(ROOT, file)
}

function report(violations: Violation[]): void {
  if (violations.length === 0) {
    process.stdout.write('✓ Images OK\n')
    return
  }

  process.stderr.write(`\n✗ ${violations.length} violation(s) images détectée(s)\n\n`)
  for (const v of violations) {
    process.stderr.write(`  [règle ${v.rule}] ${rel(v.file)}:${v.line}\n`)
    process.stderr.write(`  ${v.message}\n\n`)
  }
}

if (import.meta.main) {
  const files = collectVueFiles(APP_DIR)
  const violations = files.flatMap(checkFile)
  report(violations)
  process.exit(violations.length > 0 ? 1 : 0)
}
