<template>
  <UModal v-model:open="isCommandPaletteOpen">
    <template #content>
      <UCommandPalette :groups="groups" :close="true" @update:open="closeCommandPalette" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { WebPage } from '@schemas/interfaces'

import { computed } from 'vue'

type PageCandidate = WebPage & {
  slug?: unknown
  headline?: unknown
  metaTitle?: unknown
  name?: unknown
  description?: unknown
  metaDescription?: unknown
}

const { items } = useWebPage()
const { getLocalizedRoute } = useLang()
const { isCommandPaletteOpen, closeCommandPalette } = useDashboard()

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
</script>
