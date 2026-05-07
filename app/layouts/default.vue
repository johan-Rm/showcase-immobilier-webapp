<template>
  <div class="relative h-dvh w-screen overflow-hidden">
    <div class="absolute inset-x-0 top-0 z-50">
      <div
        class="grid min-h-24 grid-cols-2 px-4 pt-6 lg:min-h-32 2xl:min-h-48 2xl:pt-10 2xl:pl-16"
        :class="headerBackgroundClass"
      >
        <div class="justify-self-start">
          <LazyLogoMlkFull size="lg" aria-label="Retour à l'accueil" />
        </div>
        <div class="justify-self-end">
          <LazyNavigationQuickActions />
        </div>
      </div>
    </div>
    <div class="absolute right-4 bottom-4 z-50">
      <LazyNavigationSocialNetwork />
    </div>
    <UMain class="h-full w-full">
      <slot />
    </UMain>
    <LazyUdrawerDesignSystem />
    <Transition name="fade-up" appear>
      <LazyNavigationMain />
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { isPhoneDevice, isTabletPortrait } = useDeviceDetect()
const { screenStatus } = useScreenSystem()
const activeScreenId = computed<string | null>(() => screenStatus.value.currentId)

const headerBackgroundClass = computed<string>(() => {
  if (
    (isPhoneDevice.value || isTabletPortrait.value) &&
    activeScreenId.value === 'screen-panel-mdc'
  ) {
    return 'bg-background'
  }

  return ''
})
</script>
