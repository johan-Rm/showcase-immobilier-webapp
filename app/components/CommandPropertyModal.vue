<template>
  <UModal
    v-model:open="isCommandPropertyOpen"
    :ui="{
      overlay: 'bg-black/80',
      content: 'bg-foreground ring-white/10',
    }"
  >
    <template #content>
      <div class="dark">
        <UCommandPalette
          :groups="groups"
          :close="true"
          :post-filter="postFilter"
          :ui="{ item: 'cursor-pointer' }"
          placeholder="Rechercher par référence ou nom…"
          @update:open="closeCommandProperty"
        >
          <template #item="{ item }">
            <div class="min-w-0 flex-1 flex-col gap-1">
              <div class="flex items-center gap-2">
                <UBadge
                  v-if="(item as PropertyItem).identifier"
                  size="xs"
                  variant="outline"
                  color="primary"
                >
                  {{ (item as PropertyItem).identifier }}
                </UBadge>
                <span class="truncate text-sm font-medium">
                  {{ (item as PropertyItem).propertyName }}
                </span>
              </div>
              <span class="truncate text-xs opacity-60">{{ item.description }}</span>
            </div>
          </template>
        </UCommandPalette>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
// 1. Imports
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { Accommodation } from '@schemas/interfaces'

import { computed } from 'vue'

// 2. Types et constantes statiques
type PropertyItem = CommandPaletteItem & {
  identifier: string
  propertyName: string
}

// 4. Composables, stores, routeur
const { items } = useAccommodation()
const localePath = useLocalePath()
const { isCommandPropertyOpen, closeCommandProperty } = useDashboard()

// 7. Validation et helpers purs
const postFilter = (_term: string, results: CommandPaletteItem[]): CommandPaletteItem[] =>
  results.slice(0, 5)

const buildPropertyItem = (accommodation: Accommodation): PropertyItem | null => {
  const slug = accommodation.slug?.trim()
  const listingSlug = accommodation.realEstateListing?.slug?.trim()
  const categorySlug = accommodation.category?.slug?.trim()

  if (!slug || !listingSlug || !categorySlug) return null

  const identifier = accommodation.identifier?.trim() ?? ''
  const propertyName = accommodation.name?.trim() ?? slug
  const categoryName = accommodation.category?.name?.trim() ?? categorySlug

  return {
    id: `property-${identifier || slug}`,
    label: identifier ? `${identifier} ${propertyName}` : propertyName,
    description: categoryName,
    identifier,
    propertyName,
    onSelect: () => {
      closeCommandProperty()
      navigateTo(localePath(`/properties/${listingSlug}/${categorySlug}/${slug}`))
    },
  }
}

// 8. Computed UI-ready
const propertyItems = computed<PropertyItem[]>(() => {
  const seen = new Set<string>()
  return items.value
    .map(buildPropertyItem)
    .filter((item): item is PropertyItem => {
      if (!item || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
})

const groups = computed<CommandPaletteGroup[]>(() => {
  if (!propertyItems.value.length) return []
  return [
    {
      id: 'properties',
      items: propertyItems.value,
    },
  ]
})
</script>
