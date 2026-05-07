<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <h1 v-if="accessibleTitle" class="sr-only">{{ accessibleTitle }}</h1>

    <UPageSection data-screen="screen-property-list" :ui="screenUi.pageSection">
      <ScreenPropertyList
        :items-list="propertyItemsList"
        :total-count="accommodations.length"
        :active-real-estate-listing-slug="realEstateListingSlug"
        @next-screen="next"
      />
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
const route = useRoute()
const localePath = useLocalePath()
const accommodationStore = useAccommodationStore()
const { getItemsListByAccommodations } = useAccommodation()
const metadataStore = useMetadataStore()

const { getPageBySlug } = useWebPage()

const page = computed(() => getPageBySlug('nos-biens-immobiliers'))

const accessibleTitle = computed<string | undefined>(() => page.value?.headline)

const realEstateListingSlug = computed(() => {
  const param = route.params.realEstateListing
  if (Array.isArray(param)) return String(param[0] ?? '')
  return String(param ?? '')
})

const knownRealEstateListingSlugs = computed(
  () =>
    new Set(
      metadataStore.getAccommodationRealEstateListings
        .map((item: { slug?: string | null }) => item.slug)
        .filter((slug: unknown): slug is string => typeof slug === 'string' && slug.length > 0),
    ),
)

const accommodations = computed(() =>
  accommodationStore.getAccommodationsByRealEstateListing(realEstateListingSlug.value),
)
const propertyItemsList = getItemsListByAccommodations(accommodations)

if (
  metadataStore.getAccommodationRealEstateListings.length > 0 &&
  !knownRealEstateListingSlugs.value.has(realEstateListingSlug.value)
) {
  const target =
    realEstateListingSlug.value.length > 0
      ? localePath(`/${realEstateListingSlug.value}`)
      : localePath('/')

  await navigateTo(target, { replace: true })
}

const pageRef = ref<HTMLElement | null>(null)
const transitionMode = 'cross-zoom'

const { next, screenUi } = useScreenSystem({
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

usePageSeo(page, accommodations)
</script>
