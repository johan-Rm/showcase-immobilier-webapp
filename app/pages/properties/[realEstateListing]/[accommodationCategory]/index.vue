<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <UPageSection data-screen="screen-property-list" :ui="screenUi.pageSection">
      <ScreenPropertyList :total-count="accommodations.length" />
    </UPageSection>

    <UPageSection data-screen="screen-real-estate-three-col-properties" :ui="screenUi.pageSection">
      <LazyScreenRealEstateThreeColProperties />
    </UPageSection>

    <UPageSection data-screen="screen-footer" :ui="screenUi.pageSection">
      <LazyScreenFooter />
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
const page = computed(() => null)
const pageRef = ref<HTMLElement | null>(null)
const logger = useLogger({ module: 'page-properties-category-index' })

const transitionMode = 'cross-zoom'

const { screenUi } = useScreenSystem({
  axis: 'y',
  loop: false,
  keyboard: true,
  auto: true,
  touch: true,
  touchThreshold: 60,
  touchCooldownMs: 700,
  touchPreventScroll: true,
  wheel: true,
  wheelThreshold: 40,
  wheelCooldownMs: 300,
  container: pageRef,
  transitionMode,
  anchors: {
    enabled: true,
    syncMode: 'explicit-only',
    clearHashOnImplicitNavigation: true,
  },
})

const route = useRoute()
const accommodationStore = useAccommodationStore()
const realEstateListingSlug = computed(() => {
  const raw = route.params.realEstateListing
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})
const accommodationCategorySlug = computed(() => {
  const raw = route.params.accommodationCategory
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})
const accommodations = computed(() =>
  accommodationStore.getAccommodationsByRealEstateListingAndCategory(
    realEstateListingSlug.value,
    accommodationCategorySlug.value,
  ),
)

onMounted(() => {
  logger.info('Mounted page', {
    page: 'properties-category-index',
    fullPath: route.fullPath,
    realEstateListingSlug: realEstateListingSlug.value,
    accommodationCategorySlug: accommodationCategorySlug.value,
    accommodationsCount: accommodations.value.length,
  })
})

onUnmounted(() => {
  logger.info('Unmounted page', {
    page: 'properties-category-index',
    fullPath: route.fullPath,
    realEstateListingSlug: realEstateListingSlug.value,
    accommodationCategorySlug: accommodationCategorySlug.value,
  })
})

watch(
  () => route.fullPath,
  (nextFullPath, previousFullPath) => {
    logger.info('Route changed inside page', {
      page: 'properties-category-index',
      previousFullPath,
      nextFullPath,
      realEstateListingSlug: realEstateListingSlug.value,
      accommodationCategorySlug: accommodationCategorySlug.value,
    })
  },
)

usePageSeo(page, accommodations)
</script>
