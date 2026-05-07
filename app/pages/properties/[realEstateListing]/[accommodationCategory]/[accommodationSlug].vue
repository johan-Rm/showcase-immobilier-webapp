<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <UPageSection data-screen="screen-property-detail" :ui="screenUi.pageSection">
      <ScreenPropertyDetail :slug="slug" />
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
import { accommodationToWebPage } from '@services/mapper/webPage'

const route = useRoute()
const accommodationStore = useAccommodationStore()
const { loadAccommodations } = useAccommodation()

const realEstateListingSlug = computed(() => {
  const raw = route.params.realEstateListing
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})
const accommodationCategorySlug = computed(() => {
  const raw = route.params.accommodationCategory
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})
const slug = computed(() => {
  const raw = route.params.accommodationSlug
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})

await useAsyncData(
  () => `accommodation-detail:${slug.value}`,
  async () => {
    if (!accommodationStore.getAccommodations.length) {
      await loadAccommodations()
    }
    return true
  },
  {
    watch: [slug],
  },
)

const accommodation = computed(() => accommodationStore.getAccommodationBySlug(slug.value))

const page = computed(() => {
  if (!accommodation.value) return null
  return accommodationToWebPage(accommodation.value)
})

const pageRef = ref<HTMLElement | null>(null)

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

usePageSeo(page, undefined, accommodation)

if (
  !accommodation.value ||
  accommodation.value.realEstateListing?.slug !== realEstateListingSlug.value ||
  accommodation.value.category?.slug !== accommodationCategorySlug.value
) {
  throw createError({ statusCode: 404, statusMessage: 'Accommodation not found' })
}
</script>
