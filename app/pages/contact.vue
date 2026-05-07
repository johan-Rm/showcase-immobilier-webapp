<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <h1 v-if="accessibleTitle" class="sr-only">{{ accessibleTitle }}</h1>

    <UPageSection data-screen="screen-contact" :ui="screenUi.pageSection">
      <ScreenContact />
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
const CONTACT_PAGE_SLUG = 'contact'

const { getPageBySlug } = useWebPage()
const { items: accommodations } = useAccommodation()

const page = computed(() => getPageBySlug(CONTACT_PAGE_SLUG))

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Contact Page not found' })
}

const accessibleTitle = computed<string | undefined>(() => page.value?.headline)

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

usePageSeo(page, accommodations)
</script>
