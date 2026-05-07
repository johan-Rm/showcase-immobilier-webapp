/**
 * @rule docs/2.architecture/6.script-setup-standard.md
 * @see app/README.md — Convention : Structure interne de <script setup>
 *
 * Vérifie l'ordre des blocs dans <script setup lang="ts"> :
 *   Règle 1 — defineProps/defineEmits (bloc 3) avant les composables et stores (bloc 4)
 *   Règle 2 — computed/watch/watchEffect (blocs 8-10) avant les hooks lifecycle (bloc 12)
 *
 * Scope : app/components/, app/pages/
 * Mode : erreur bloquante (exit 1)
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const SCAN_DIRS = [join(ROOT, 'app', 'components'), join(ROOT, 'app', 'pages')]
const EXCLUDED = new Set(['node_modules', '.nuxt', 'dist', '.git'])

// Bloc 3 : contrats d'interface du composant
const BLOCK3 = /\b(?:defineProps|defineEmits)\s*[<(]/
// Bloc 4 : composables, stores, routeur (use + majuscule, ou storeToRefs)
const BLOCK4 = /\b(?:use[A-Z]\w*|storeToRefs)\s*\(/
// Blocs 8-10 : computed, watch, watchEffect
const BLOCK8_10 = /\b(?:computed|watch|watchEffect)\s*\(/
// Bloc 12 : hooks lifecycle Vue
const BLOCK12 =
  /\b(?:onMounted|onUnmounted|onBeforeMount|onBeforeUnmount|onUpdated|onBeforeUpdate|onErrorCaptured|onActivated|onDeactivated|onServerPrefetch)\s*\(/

export type FilePath = string
export type BlockScan = {
  firstBlock3: number | null
  firstBlock4: number | null
  lastBlock8_10: number | null
  firstBlock12: number | null
}
export type Violation = {
  file: FilePath
  rule: 1 | 2
  line: number
  message: string
}

export function collectVueFiles(dirs: string[]): FilePath[] {
  const files: FilePath[] = []

  function walk(dir: string): void {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (EXCLUDED.has(entry)) continue
      const full = join(dir, entry)
      try {
        if (statSync(full).isDirectory()) walk(full)
        else if (extname(entry) === '.vue') files.push(full)
      } catch {
        /* skip unreadable */
      }
    }
  }

  for (const dir of dirs) walk(dir)
  return files
}

export function extractScriptBlock(content: string): { text: string; lineOffset: number } | null {
  const match =
    content.match(/<script\b[^>]*\bsetup\b[^>]*>([\s\S]*?)<\/script>/i) ??
    content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)
  if (!match || match[1] === undefined || match.index === undefined) return null

  const headerLen = match[0].length - match[1].length - '</script>'.length
  const lineOffset = content.slice(0, match.index + headerLen).split('\n').length - 1
  return { text: match[1], lineOffset }
}

function isCommentOrEmpty(line: string): boolean {
  const t = line.trimStart()
  return t === '' || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
}

export function scanBlocks(script: string): BlockScan {
  const lines = script.split('\n')
  let firstBlock3: number | null = null
  let firstBlock4: number | null = null
  let lastBlock8_10: number | null = null
  let firstBlock12: number | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (isCommentOrEmpty(line)) continue
    const lineNo = i + 1

    if (firstBlock3 === null && BLOCK3.test(line)) firstBlock3 = lineNo
    if (firstBlock4 === null && BLOCK4.test(line)) firstBlock4 = lineNo
    if (BLOCK8_10.test(line)) lastBlock8_10 = lineNo
    if (firstBlock12 === null && BLOCK12.test(line)) firstBlock12 = lineNo
  }

  return { firstBlock3, firstBlock4, lastBlock8_10, firstBlock12 }
}

export function findViolations(scan: BlockScan, lineOffset: number, file: FilePath): Violation[] {
  const abs = (n: number) => lineOffset + n
  const violations: Violation[] = []

  if (
    scan.firstBlock3 !== null &&
    scan.firstBlock4 !== null &&
    scan.firstBlock3 > scan.firstBlock4
  ) {
    violations.push({
      file,
      rule: 1,
      line: abs(scan.firstBlock3),
      message: `defineProps/defineEmits (script:${scan.firstBlock3}) après un composable/store (script:${scan.firstBlock4}) — bloc 3 doit précéder bloc 4`,
    })
  }

  if (
    scan.firstBlock12 !== null &&
    scan.lastBlock8_10 !== null &&
    scan.firstBlock12 < scan.lastBlock8_10
  ) {
    violations.push({
      file,
      rule: 2,
      line: abs(scan.firstBlock12),
      message: `hook lifecycle (script:${scan.firstBlock12}) avant un computed/watch (script:${scan.lastBlock8_10}) — bloc 12 doit suivre les blocs 8-10`,
    })
  }

  return violations
}

export function checkFile(file: FilePath): Violation[] {
  let content: string
  try {
    content = readFileSync(file, 'utf-8')
  } catch {
    return []
  }

  const block = extractScriptBlock(content)
  if (!block) return []

  const scan = scanBlocks(block.text)
  return findViolations(scan, block.lineOffset, file)
}

function rel(file: FilePath): string {
  return relative(ROOT, file)
}

function report(violations: Violation[]): void {
  if (violations.length === 0) {
    process.stdout.write('✓ Script setup order OK\n')
    return
  }

  process.stderr.write(`\n✗ ${violations.length} violation(s) d'ordre de blocs détectée(s)\n\n`)
  for (const v of violations) {
    process.stderr.write(`  [règle ${v.rule}] ${rel(v.file)}:${v.line}\n`)
    process.stderr.write(`  ${v.message}\n\n`)
  }
}

if (import.meta.main) {
  const files = collectVueFiles(SCAN_DIRS)
  const violations = files.flatMap(checkFile)
  report(violations)
  process.exit(violations.length > 0 ? 1 : 0)
}
