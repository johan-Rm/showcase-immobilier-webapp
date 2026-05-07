import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import {
  checkFile,
  extractScriptBlock,
  findViolations,
  scanBlocks,
} from './verify-script-setup-standard'

const TMP = join(fileURLToPath(new URL('.', import.meta.url)), '.tmp-test-setup-order')

function write(rel: string, content: string): string {
  const full = join(TMP, rel)
  mkdirSync(join(TMP, rel.split('/').slice(0, -1).join('/')), { recursive: true })
  writeFileSync(full, content, 'utf-8')
  return full
}

beforeEach(() => mkdirSync(TMP, { recursive: true }))
afterEach(() => rmSync(TMP, { recursive: true, force: true }))

// --- extractScriptBlock ---

describe('extractScriptBlock', () => {
  test('extrait le contenu et le lineOffset d\'un bloc <script setup lang="ts">', () => {
    const content = `<template><div/></template>\n<script setup lang="ts">\nconst x = 1\n</script>`
    const result = extractScriptBlock(content)
    expect(result).not.toBeNull()
    expect(result!.text).toContain('const x = 1')
    expect(result!.lineOffset).toBe(1)
  })

  test('retourne null si pas de bloc script', () => {
    expect(extractScriptBlock('<template><div/></template>')).toBeNull()
  })

  test('fonctionne sans attribut setup (fallback)', () => {
    const content = `<script>\nconst y = 2\n</script>`
    const result = extractScriptBlock(content)
    expect(result).not.toBeNull()
    expect(result!.text).toContain('const y = 2')
  })
})

// --- scanBlocks ---

describe('scanBlocks', () => {
  test('détecte defineProps avant useRoute (ordre correct)', () => {
    const script = `
const props = defineProps<{ id: string }>()
const route = useRoute()
const label = computed(() => props.id)
`
    const scan = scanBlocks(script)
    expect(scan.firstBlock3).not.toBeNull()
    expect(scan.firstBlock4).not.toBeNull()
    expect(scan.firstBlock3!).toBeLessThan(scan.firstBlock4!)
  })

  test('détecte useRoute avant defineProps (violation règle 1)', () => {
    const script = `
const route = useRoute()
const props = defineProps<{ id: string }>()
`
    const scan = scanBlocks(script)
    expect(scan.firstBlock3!).toBeGreaterThan(scan.firstBlock4!)
  })

  test('détecte computed avant onMounted (ordre correct)', () => {
    const script = `
const label = computed(() => 'x')
onMounted(() => { console.log('ok') })
`
    const scan = scanBlocks(script)
    expect(scan.lastBlock8_10!).toBeLessThan(scan.firstBlock12!)
  })

  test('détecte onMounted avant computed (violation règle 2)', () => {
    const script = `
onMounted(() => { console.log('ok') })
const label = computed(() => 'x')
`
    const scan = scanBlocks(script)
    expect(scan.firstBlock12!).toBeLessThan(scan.lastBlock8_10!)
  })

  test('ignore les lignes de commentaire', () => {
    const script = `
// const route = useRoute()
/* defineProps */
* defineEmits
const x = ref(0)
`
    const scan = scanBlocks(script)
    expect(scan.firstBlock3).toBeNull()
    expect(scan.firstBlock4).toBeNull()
  })

  test('retourne null sur tous les blocs si script vide', () => {
    const scan = scanBlocks('')
    expect(scan.firstBlock3).toBeNull()
    expect(scan.firstBlock4).toBeNull()
    expect(scan.lastBlock8_10).toBeNull()
    expect(scan.firstBlock12).toBeNull()
  })
})

// --- findViolations ---

describe('findViolations', () => {
  test('aucune violation si ordre respecté', () => {
    const scan = { firstBlock3: 2, firstBlock4: 5, lastBlock8_10: 8, firstBlock12: 11 }
    expect(findViolations(scan, 0, 'file.vue')).toHaveLength(0)
  })

  test('violation règle 1 si defineProps après composable', () => {
    const scan = { firstBlock3: 5, firstBlock4: 2, lastBlock8_10: null, firstBlock12: null }
    const v = findViolations(scan, 0, 'file.vue')
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe(1)
  })

  test('violation règle 2 si lifecycle avant computed', () => {
    const scan = { firstBlock3: null, firstBlock4: null, lastBlock8_10: 10, firstBlock12: 7 }
    const v = findViolations(scan, 0, 'file.vue')
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe(2)
  })

  test('lineOffset est ajouté au numéro de ligne absolu', () => {
    const scan = { firstBlock3: 5, firstBlock4: 2, lastBlock8_10: null, firstBlock12: null }
    const v = findViolations(scan, 10, 'file.vue')
    expect(v[0]!.line).toBe(15)
  })

  test('pas de violation règle 1 si defineProps seul (pas de composable)', () => {
    const scan = { firstBlock3: 2, firstBlock4: null, lastBlock8_10: null, firstBlock12: null }
    expect(findViolations(scan, 0, 'file.vue')).toHaveLength(0)
  })

  test('pas de violation règle 2 si lifecycle seul (pas de computed)', () => {
    const scan = { firstBlock3: null, firstBlock4: null, lastBlock8_10: null, firstBlock12: 5 }
    expect(findViolations(scan, 0, 'file.vue')).toHaveLength(0)
  })
})

// --- checkFile (intégration) ---

describe('checkFile', () => {
  test('aucune violation sur un composant bien ordonné', () => {
    const file = write(
      'components/Good.vue',
      `<template><div>{{ label }}</div></template>
<script setup lang="ts">
const props = defineProps<{ id: string }>()
const route = useRoute()
const label = computed(() => props.id)
onMounted(() => {})
</script>`,
    )
    expect(checkFile(file)).toHaveLength(0)
  })

  test('violation règle 1 : useRoute avant defineProps', () => {
    const file = write(
      'components/Bad1.vue',
      `<template><div/></template>
<script setup lang="ts">
const route = useRoute()
const props = defineProps<{ id: string }>()
</script>`,
    )
    const v = checkFile(file)
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe(1)
  })

  test('violation règle 2 : onMounted avant computed', () => {
    const file = write(
      'components/Bad2.vue',
      `<template><div/></template>
<script setup lang="ts">
const store = useMyStore()
onMounted(() => {})
const label = computed(() => store.value)
</script>`,
    )
    const v = checkFile(file)
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe(2)
  })

  test('retourne [] si le fichier ne contient pas de bloc script', () => {
    const file = write('components/NoScript.vue', '<template><div/></template>')
    expect(checkFile(file)).toHaveLength(0)
  })

  test('retourne [] si le fichier est illisible', () => {
    expect(checkFile('/nonexistent/path/File.vue')).toHaveLength(0)
  })
})
