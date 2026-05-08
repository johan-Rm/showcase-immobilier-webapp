<template>
  <UModal v-model:open="isCommandPaletteOpen">
    <template #content>
      <UCommandPalette :groups="groups" :close="true" @update:open="closeCommandPalette" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
// 1. Imports
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { WebPage } from '@schemas/interfaces'

import { computed } from 'vue'

// 2. Types et constantes statiques
type PageCandidate = WebPage & {
  slug?: unknown
  headline?: unknown
  metaTitle?: unknown
  name?: unknown
  description?: unknown
  metaDescription?: unknown
}

// 3. Props et emits

// 4. Composables, stores, routeur
const { items } = useWebPage()

const { getLocalizedRoute } = useLang()

const { isCommandPaletteOpen, closeCommandPalette } = useDashboard()

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs
const toCleanString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const buildPageItem = (page: PageCandidate): CommandPaletteItem | null => {
  const slug = toCleanString(page.slug)
  if (!slug) return null

  const label =
    toCleanString(page.headline) ??
    toCleanString(page.name) ??
    toCleanString(page.metaTitle) ??
    slug

  const description =
    toCleanString(page.description) ?? toCleanString(page.metaDescription) ?? undefined

  return {
    id: `page-${slug}`,
    label,
    description,
    onSelect: () => {
      closeCommandPalette()
      navigateTo(
        getLocalizedRoute({
          name: 'page',
          params: { page: slug },
        }),
      )
    },
  }
}

// 8. Computed UI-ready

// 9. Actions et handlers
const pageItems = computed<CommandPaletteItem[]>(() =>
  items.value
    .map((page) => buildPageItem(page as PageCandidate))
    .filter((item): item is CommandPaletteItem => item !== null),
)

const groups = computed<CommandPaletteGroup[]>(() => {
  if (!pageItems.value.length) return []
  return [
    {
      id: 'pages',
      label: 'Pages',
      items: pageItems.value,
    },
  ]
})

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
