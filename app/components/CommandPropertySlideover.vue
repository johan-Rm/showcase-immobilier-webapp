<template>
  <USlideover
    :open="isCommandPropertyOpen"
    :side="isMobile ? 'bottom' : 'right'"
    :ui="slideoverUi"
    @update:open="handleOpenChange"
  >
    <template #content>
      <div class="flex h-dvh min-h-0 flex-col bg-[#212121] text-white">
        <!-- Liseré olive -->
        <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />

        <!-- Header : titre + fermeture -->
        <div class="flex shrink-0 items-center gap-3 px-5 pt-5 pb-4">
          <p class="flex-1 text-[0.6rem] font-semibold tracking-[0.22em] text-white/40 uppercase">
            Rechercher un bien
          </p>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Fermer"
            class="text-white/40 hover:bg-white/10 hover:text-white"
            @click="closeCommandProperty"
          />
        </div>

        <!-- Champ de recherche -->
        <div class="shrink-0 px-5 pb-3">
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Rechercher par référence ou nom…"
            autofocus
            class="w-full"
            :ui="{ base: 'bg-white/5 text-white placeholder:text-white/35' }"
          />
        </div>

        <div class="mx-5 h-px shrink-0 bg-white/5" />

        <!-- Liste scrollable -->
        <div class="min-h-0 flex-1 overflow-y-auto">
          <ul v-if="filteredItems.length" class="space-y-0.5 px-5 py-2">
            <li v-for="item in filteredItems" :key="item.id">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                @click="item.onSelect"
              >
                <span class="shrink-0 font-mono text-[0.6rem] leading-none text-white/35">
                  {{ item.identifier }}
                </span>
                <span class="min-w-0 truncate text-xs text-white/60">
                  {{ item.propertyName }}
                </span>
              </button>
            </li>
          </ul>
          <p v-else class="px-5 py-6 text-center text-xs text-white/35">Aucun bien trouvé.</p>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
// 1. Imports
import type { Accommodation } from '@schemas/interfaces'

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// 2. Types et constantes statiques
type PropertyItem = {
  id: string
  identifier: string
  propertyName: string
  searchValue: string
  onSelect: () => void
}

// 4. Composables, stores, routeur
const { items } = useAccommodation()
const localePath = useLocalePath()
const { isCommandPropertyOpen, closeCommandProperty } = useDashboard()

// 5. Etat local
const query = ref('')
const isMobile = ref(false)

// 7. Validation et helpers purs
const buildPropertyItem = (accommodation: Accommodation): PropertyItem | null => {
  const slug = accommodation.slug?.trim()
  const listingSlug = accommodation.realEstateListing?.slug?.trim()
  const categorySlug = accommodation.category?.slug?.trim()

  if (!slug || !listingSlug || !categorySlug) return null

  const identifier = accommodation.identifier?.trim() ?? ''
  const propertyName = accommodation.name?.trim() ?? slug

  return {
    id: `property-${identifier || slug}`,
    identifier,
    propertyName,
    searchValue: `${identifier} ${propertyName}`.toLowerCase(),
    onSelect: () => {
      closeCommandProperty()
      navigateTo(localePath(`/properties/${listingSlug}/${categorySlug}/${slug}`))
    },
  }
}

// 8. Computed UI-ready
const propertyItems = computed<PropertyItem[]>(() => {
  const seen = new Set<string>()
  return items.value.map(buildPropertyItem).filter((item): item is PropertyItem => {
    if (!item || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
})

const filteredItems = computed<PropertyItem[]>(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return propertyItems.value
  return propertyItems.value.filter((item) => item.searchValue.includes(term))
})

const slideoverUi = computed(() =>
  isMobile.value
    ? {
        content: 'max-h-[82dvh] bg-[#212121] text-white ring-0 shadow-none',
        overlay: 'bg-black/55',
      }
    : {
        content:
          'max-w-[min(92vw,26rem)] bg-[#212121] text-white ring-0 sm:ring-0 shadow-none sm:shadow-none',
        overlay: 'bg-black/55',
      },
)

// 9. Actions et handlers
const handleOpenChange = (open: boolean): void => {
  if (!open) closeCommandProperty()
}

// 10. Watch et watchEffect
watch(isCommandPropertyOpen, (open) => {
  if (!open) query.value = ''
})

// 12. Lifecycle
onMounted(() => {
  const mq = window.matchMedia('(max-width: 1023px)')
  isMobile.value = mq.matches
  const handler = (e: MediaQueryListEvent): void => {
    isMobile.value = e.matches
  }
  mq.addEventListener('change', handler)
  onUnmounted(() => mq.removeEventListener('change', handler))
})
</script>
