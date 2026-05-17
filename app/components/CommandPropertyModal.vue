<template>
  <UModal v-model:open="isCommandPropertyOpen">
    <template #content>
      <UCommandPalette
        :groups="groups"
        :close="true"
        placeholder="Rechercher par référence ou nom…"
        @update:open="closeCommandProperty"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
// 1. Imports
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { Accommodation } from '@schemas/interfaces'

import { computed } from 'vue'

// 4. Composables, stores, routeur
const { items } = useAccommodation()
const localePath = useLocalePath()
const { isCommandPropertyOpen, closeCommandProperty } = useDashboard()

// 7. Validation et helpers purs
const buildPropertyItem = (accommodation: Accommodation): CommandPaletteItem | null => {
  const slug = accommodation.slug?.trim()
  const listingSlug = accommodation.realEstateListing?.slug?.trim()
  const categorySlug = accommodation.category?.slug?.trim()

  if (!slug || !listingSlug || !categorySlug) return null

  const identifier = accommodation.identifier?.trim() ?? ''
  const name = accommodation.name?.trim() ?? slug
  const categoryName = accommodation.category?.name?.trim() ?? categorySlug

  return {
    id: `property-${identifier || slug}`,
    label: identifier ? `[${identifier}] ${name}` : name,
    description: categoryName,
    onSelect: () => {
      closeCommandProperty()
      navigateTo(localePath(`/properties/${listingSlug}/${categorySlug}/${slug}`))
    },
  }
}

// 8. Computed UI-ready
const propertyItems = computed<CommandPaletteItem[]>(() =>
  items.value
    .map(buildPropertyItem)
    .filter((item): item is CommandPaletteItem => item !== null),
)

const groups = computed<CommandPaletteGroup[]>(() => {
  if (!propertyItems.value.length) return []
  return [
    {
      id: 'properties',
      label: 'Biens immobiliers',
      items: propertyItems.value,
    },
  ]
})
</script>
