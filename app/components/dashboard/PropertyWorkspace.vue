<template>
  <section class="pages-dashboard-property-workspace h-dvh w-screen overflow-hidden">
    <!-- Colonnes : contenu + sidebar -->
    <div class="flex h-full">
      <!-- Zone de contenu principale avec image en fond -->
      <div class="pointer-events-none relative flex flex-1 flex-col pt-12 lg:pt-0">
        <div class="absolute inset-0">
          <template v-if="currentImageUrl">
            <AppImage
              :key="currentImageUrl"
              :src="currentImageUrl"
              :alt="activeAccommodation?.preview.title ?? 'Bien immobilier'"
              v-bind="IMAGE_PRESETS.heroFullScreen"
              class="h-full w-full object-cover object-center"
              loading="eager"
              fetchpriority="high"
              :preload="true"
            />
            <AppOverlay :percentage="55" />
          </template>
          <div v-else class="flex h-full w-full items-end justify-center bg-[#212121] pb-10">
            <p class="text-xs font-light tracking-[0.4em] text-white/55 uppercase select-none">
              Image non disponible
            </p>
          </div>
        </div>

        <div class="relative z-10 flex min-h-0 flex-1 flex-col">
          <DashboardPropertyPreview
            :accommodation="activeAccommodation"
            :filtered-count="filteredItems.length"
            @prev="goPrev"
            @next="goNext"
            @edit="openEditor"
          />
        </div>
      </div>

      <!-- Sidebar droite (desktop) / Topbar mobile -->
      <aside class="flex h-full w-0 shrink-0 flex-col overflow-hidden bg-[#212121] lg:w-68">
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
          @create="openCreator"
          @select="activeIndex = $event"
          @update:selected-listing="selectedListing = $event"
          @update:selected-category="selectedCategory = $event"
          @update:identifier-search="identifierSearch = $event"
        />
      </aside>
    </div>

    <DashboardPropertyEditorSlideover
      v-model:open="isEditorOpen"
      v-model:process="editorProcess"
      :accommodation="activeAccommodation"
      @saved="emit('saved')"
    />
  </section>
</template>

<script setup lang="ts">
// 1. Imports

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

type EditorProcess = 'edit' | 'create'

const ALL_VALUE = '__all__'

// 3. Props et emits
const props = defineProps<{
  data: DashboardAccommodationsResponse
  user?: WorkspaceUser
}>()

const emit = defineEmits<{
  refresh: []
  saved: []
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
const editorProcess = ref<EditorProcess>('edit')

// 6. Data inputs

// 7. Validation et helpers purs
const getAdjacentIndexes = (index: number, total: number): number[] => {
  if (total <= 1) return []
  return [(index - 1 + total) % total, (index + 1) % total]
}

const getPrimaryImageUrl = (item: DashboardAccommodation | undefined): string => {
  if (!item) return ''
  return item.preview.media[0]?.imageUrl || item.preview.primaryImageUrl || ''
}

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

const filteredHeroImageUrls = computed<string[]>(() =>
  filteredItems.value.map((item) => getPrimaryImageUrl(item)).filter(Boolean),
)

useImageWarmup(filteredHeroImageUrls, {
  stateKey: 'dashboard-all-hero',
  preset: 'heroFullScreen',
  batchSize: 2,
  batchDelayMs: 800,
})

// 9. Actions et handlers
const preloadAdjacentProperties = (index: number): void => {
  if (!import.meta.client) return

  const items = filteredItems.value
  const adjacent = getAdjacentIndexes(index, items.length)

  adjacent.forEach((i) => {
    prefetchWithPreset(getPrimaryImageUrl(items[i]), 'heroFullScreen')
  })
}

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

const openCreator = (): void => {
  editorProcess.value = 'create'
  isEditorOpen.value = true
}

const openEditor = (): void => {
  editorProcess.value = 'edit'
  isEditorOpen.value = true
}

// 10. Watch et watchEffect
watch(activeIndex, preloadAdjacentProperties, { immediate: true })

watch([selectedListing, selectedCategory, identifierSearch], () => {
  activeIndex.value = 0
  activeMediaIndex.value = 0
})

watch(filteredItems, () => {
  clampActiveIndex()
  preloadAdjacentProperties(activeIndex.value)
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
