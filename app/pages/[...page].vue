<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <UPageSection data-screen="screen-panel-mdc" :ui="screenUi.pageSection">
      <ScreenPanelMDC :web-page-slug="slug" />
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
const pattern = /^[a-z](?:[a-z0-9]*)(?:-[a-z0-9]+)*$/
const route = useRoute()

definePageMeta({
  validate: (route) => {
    const param = route.params.page
    if (Array.isArray(param)) {
      return param.length === 1 && pattern.test(param[0] ?? '')
    }
    return typeof param === 'string' && pattern.test(param)
  },
})

const slug = computed(() => {
  const param = route.params.page
  if (Array.isArray(param)) return param[0] ?? ''
  return typeof param === 'string' ? param : ''
})
const { getPageBySlug } = useWebPage()
const page = computed(() => getPageBySlug(slug.value))
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

usePageSeo(page)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>
