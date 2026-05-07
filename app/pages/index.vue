<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <h1 v-if="accessibleTitle" class="sr-only">{{ accessibleTitle }}</h1>

    <UPageSection :data-screen="SCREEN_IDS.landing" :ui="screenUi.pageSection">
      <component :is="activeLandingScreen.component" :data="landingScreenData" @next-screen="next" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens"
      :data-screen="SCREEN_IDS.whyChooseMlk"
      :ui="screenUi.pageSection"
    >
      <LazyScreenWhyChooseMlk :data="whyChooseMlkData" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens && !isPhoneDevice"
      :data-screen="SCREEN_IDS.essaouiraTheJewel"
      :ui="screenUi.pageSection"
    >
      <LazyScreenEssaouiraTheJewel :data="essaouiraTheJewelData" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens"
      :data-screen="SCREEN_IDS.invest"
      :ui="screenUi.pageSection"
    >
      <LazyScreenInvesting :data="investData" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens && !isPhoneDevice"
      :data-screen="SCREEN_IDS.panelScrollDualSynced"
      :ui="screenUi.pageSection"
    >
      <LazyScreenPanelScrollDualSynced :data="panelScrollDualSyncedData" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens && !isPhoneDevice"
      :data-screen="SCREEN_IDS.blockquote"
      :ui="screenUi.pageSection"
    >
      <LazyScreenBlockquote :data="blockquoteData" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens"
      :data-screen="SCREEN_IDS.realEstateThreeColProperties"
      :ui="screenUi.pageSection"
    >
      <LazyScreenRealEstateThreeColProperties :data="realEstateThreeColPropertiesData" />
    </UPageSection>

    <UPageSection
      v-if="shouldRenderDeferredScreens"
      :data-screen="SCREEN_IDS.footer"
      :ui="screenUi.pageSection"
    >
      <LazyScreenFooter :data="footerData" />
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import ScreenRealEstateFullImage from '~/components/screen/real-estate/FullImage.vue'
import ScreenRealEstateSplit from '~/components/screen/real-estate/Split.vue'
import ScreenRealEstateThreeColProperties from '~/components/screen/real-estate/ThreeColProperties.vue'

type LandingScreenConfig = {
  slug: string
  screenId: string
  component: Component
}

const SCREEN_IDS = {
  landing: 'screen-landing',
  realEstateFullImage: 'screen-real-estate-full-image',
  realEstateSplit: 'screen-real-estate-split',
  realEstateThreeColProperties: 'screen-real-estate-three-col-properties',
  whyChooseMlk: 'screen-why-choose-mlk',
  essaouiraTheJewel: 'screen-essaouira-the-jewel',
  invest: 'screen-invest',
  panelScrollDualSynced: 'screen-panel-scroll-dual-synced',
  blockquote: 'screen-blockquote',
  footer: 'screen-footer',
} as const

const LANDING_SLUGS = {
  fullImage: 'full-image',
  split: 'split',
  threeColProperties: 'three-col-properties',
} as const

const landingScreens = [
  {
    slug: LANDING_SLUGS.fullImage,
    screenId: SCREEN_IDS.realEstateFullImage,
    component: ScreenRealEstateFullImage,
  },
  {
    slug: LANDING_SLUGS.split,
    screenId: SCREEN_IDS.realEstateSplit,
    component: ScreenRealEstateSplit,
  },
  {
    slug: LANDING_SLUGS.threeColProperties,
    screenId: SCREEN_IDS.realEstateThreeColProperties,
    component: ScreenRealEstateThreeColProperties,
  },
] as const satisfies readonly LandingScreenConfig[]

const DEFAULT_LANDING_SLUG = LANDING_SLUGS.fullImage
const DEFAULT_LANDING_SCREEN =
  landingScreens.find((screen) => screen.slug === DEFAULT_LANDING_SLUG) ?? landingScreens[0]
const HOME_PAGE_SLUG = 'home'

const transitionMode = 'cross-zoom'

const { isPhoneDevice } = useDeviceDetect()
const route = useRoute()
const appConfig = useAppConfig()

// const { getPageBySlug } = useWebPage()
const { getPageBySlug, getPageComponentByIdentifier } = useWebPage()
const { items: accommodations } = useAccommodation()
// const { screenStatus } = useScreenSystem()
const { runtimeReady } = useDeferredRuntime()

const pageRef = ref<HTMLElement | null>(null)
const shouldRenderDeferredScreens = ref(false)

const page = computed(() => getPageBySlug(HOME_PAGE_SLUG))

const getComponentByIdentifier = (identifier: string) =>
  getPageComponentByIdentifier(page.value, identifier)

const accessibleTitle = computed<string | undefined>(() => appConfig.organization.fullName)

const landingParam = computed(() => {
  const raw = route.query.landing
  if (Array.isArray(raw)) return raw[0] ?? DEFAULT_LANDING_SLUG
  return typeof raw === 'string' && raw ? raw : DEFAULT_LANDING_SLUG
})

const activeLandingScreen = computed(() => {
  return (
    landingScreens.find((screen) => screen.slug === landingParam.value) ?? DEFAULT_LANDING_SCREEN
  )
})

const activeLandingScreenId = computed(() => activeLandingScreen.value.screenId)

const landingScreenData = computed(
  () => getComponentByIdentifier(activeLandingScreenId.value) ?? undefined,
)

const whyChooseMlkData = computed(
  () => getComponentByIdentifier(SCREEN_IDS.whyChooseMlk) ?? undefined,
)

const essaouiraTheJewelData = computed(
  () => getComponentByIdentifier(SCREEN_IDS.essaouiraTheJewel) ?? undefined,
)

const investData = computed(() => getComponentByIdentifier(SCREEN_IDS.invest) ?? undefined)

const panelScrollDualSyncedData = computed(
  () => getComponentByIdentifier(SCREEN_IDS.panelScrollDualSynced) ?? undefined,
)

const blockquoteData = computed(() => getComponentByIdentifier(SCREEN_IDS.blockquote) ?? undefined)

const realEstateThreeColPropertiesData = computed(
  () => getComponentByIdentifier(SCREEN_IDS.realEstateThreeColProperties) ?? undefined,
)

const footerData = computed(() => getComponentByIdentifier(SCREEN_IDS.footer) ?? undefined)

const { next, screenUi } = useScreenSystem({
  axis: 'x',
  loop: false,
  keyboard: true,
  auto: true,
  touch: true,
  touchThreshold: 60,
  touchCooldownMs: 700,
  touchPreventScroll: true,
  wheel: true,
  wheelThreshold: 120,
  wheelCooldownMs: 300,
  transitionMode,
  container: pageRef,
  anchors: {
    enabled: true,
    syncMode: 'explicit-only',
    clearHashOnImplicitNavigation: true,
  },
})

usePageSeo(page, accommodations)

watch(
  runtimeReady,
  (value) => {
    if (value) {
      shouldRenderDeferredScreens.value = true
    }
  },
  { immediate: true },
)
</script>
