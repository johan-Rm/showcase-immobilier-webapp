<template>
  <section class="pages-dashboard-property-workspace h-dvh w-screen overflow-hidden">
    <!-- Colonnes : contenu + sidebar -->
    <div class="flex h-full">
      <!-- Zone de contenu principale avec image en fond -->
      <div class="pointer-events-none relative flex flex-1 flex-col pt-12 lg:pt-0">
        <div class="absolute inset-0">
          <AppImage
            v-if="currentImageUrl"
            :key="currentImageUrl"
            :src="currentImageUrl"
            :alt="activeAccommodation?.preview.title ?? 'Bien immobilier'"
            class="h-full w-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
            :preload="true"
          />

          <div v-else class="flex h-full w-full items-start justify-center bg-[#212121] pt-16">
            <p class="text-xs font-light tracking-[0.4em] text-white/15 uppercase select-none">
              Image non disponible
            </p>
          </div>

          <AppOverlay :percentage="55" />
        </div>

        <div class="relative z-10 flex min-h-0 flex-1 flex-col">
          <DashboardPropertyPreview
            :accommodation="activeAccommodation"
            :filtered-count="filteredItems.length"
            @prev="goPrev"
            @next="goNext"
            @edit="isEditorOpen = true"
          />
        </div>
      </div>

      <!-- Sidebar droite (desktop) / Topbar mobile -->
      <aside class="hidden h-full w-68 shrink-0 flex-col bg-[#212121] lg:flex">
        <DashboardPropertySidebar
          :user="user"
          :listing-options="listingOptions"
          :category-options="categoryOptions"
          :selected-listing="selectedListing"
          :selected-category="selectedCategory"
          :identifier-search="identifierSearch"
          :filtered-count="filteredItems.length"
          :active-index="activeIndex"
          :filtered-items="filteredItems"
          @refresh="emit('refresh')"
          @logout="emit('logout')"
          @prev="goPrev"
          @next="goNext"
          @select="activeIndex = $event"
          @update:selected-listing="selectedListing = $event"
          @update:selected-category="selectedCategory = $event"
          @update:identifier-search="identifierSearch = $event"
        />
      </aside>
    </div>

    <DashboardPropertyEditorSlideover
      v-model:open="isEditorOpen"
      :accommodation="activeAccommodation"
    />
  </section>
</template>

<script setup lang="ts">
// 1. Imports
import type {
  DashboardAccommodation,
  DashboardAccommodationsResponse,
  DashboardFilterOption,
} from '#shared/types/dashboardAccommodation'

// 2. Types et constantes statiques
type SelectOption = {
  label: string
  value: string
}

type WorkspaceUser = {
  id?: string
  name?: string
  email?: string
  picture?: string
} | null

const ALL_VALUE = '__all__'

// 3. Props et emits
const props = defineProps<{
  data: DashboardAccommodationsResponse
  user?: WorkspaceUser
}>()

const emit = defineEmits<{
  refresh: []
  logout: []
}>()

// 4. Composables, stores, routeur

// 5. Etat local
const selectedListing = ref(ALL_VALUE)
const selectedCategory = ref(ALL_VALUE)
const identifierSearch = ref('')
const activeIndex = ref(0)
const activeMediaIndex = ref(0)
const isEditorOpen = ref(false)

// 6. Data inputs

// 7. Validation et helpers purs
const toSelectOptions = (items: DashboardFilterOption[], fallback: string): SelectOption[] => [
  { label: fallback, value: ALL_VALUE },
  ...items.map((item) => ({ label: `${item.label} (${item.count})`, value: item.value })),
]

const matchesSearch = (item: DashboardAccommodation, search: string): boolean => {
  if (!search) return true

  const query = search.trim().toLowerCase()
  return (
    item.identifier.toLowerCase().includes(query) ||
    item.slug.toLowerCase().includes(query) ||
    item.preview.title.toLowerCase().includes(query)
  )
}

// 8. Computed UI-ready
const items = computed<DashboardAccommodation[]>(() => props.data.items)

const listingOptions = computed<SelectOption[]>(() =>
  toSelectOptions(props.data.filters.listings, 'Tous les types'),
)

const categoryOptions = computed<SelectOption[]>(() =>
  toSelectOptions(props.data.filters.categories, 'Toutes les catégories'),
)

const filteredItems = computed<DashboardAccommodation[]>(() =>
  items.value.filter((item) => {
    if (selectedListing.value !== ALL_VALUE && item.preview.listingSlug !== selectedListing.value) {
      return false
    }
    if (
      selectedCategory.value !== ALL_VALUE &&
      item.preview.categorySlug !== selectedCategory.value
    ) {
      return false
    }

    return matchesSearch(item, identifierSearch.value)
  }),
)

const activeAccommodation = computed<DashboardAccommodation | null>(() => {
  return filteredItems.value[activeIndex.value] ?? filteredItems.value[0] ?? null
})

const currentImageUrl = computed<string>(() => {
  const media = activeAccommodation.value?.preview.media ?? []
  return (
    media[activeMediaIndex.value]?.imageUrl ||
    activeAccommodation.value?.preview.primaryImageUrl ||
    ''
  )
})

// 9. Actions et handlers
const clampActiveIndex = (): void => {
  if (activeIndex.value >= filteredItems.value.length) {
    activeIndex.value = Math.max(0, filteredItems.value.length - 1)
  }
}

const goPrev = (): void => {
  if (!filteredItems.value.length) return
  activeIndex.value =
    activeIndex.value <= 0 ? filteredItems.value.length - 1 : activeIndex.value - 1
}

const goNext = (): void => {
  if (!filteredItems.value.length) return
  activeIndex.value =
    activeIndex.value >= filteredItems.value.length - 1 ? 0 : activeIndex.value + 1
}

// 10. Watch et watchEffect
watch([selectedListing, selectedCategory, identifierSearch], () => {
  activeIndex.value = 0
  activeMediaIndex.value = 0
})

watch(filteredItems, () => {
  clampActiveIndex()
})

watch(
  () => activeAccommodation.value?.slug,
  () => {
    activeMediaIndex.value = 0
  },
)

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
