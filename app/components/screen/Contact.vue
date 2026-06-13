<template>
  <section
    class="screen-contact relative h-dvh min-h-svh w-full overflow-hidden bg-black text-white"
  >
    <AppImage
      :src="backgroundImageUrl"
      alt="empty"
      fetchpriority="low"
      :placeholder="false"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover object-center"
      v-bind="IMAGE_PRESETS.fullscreenCover"
    />

    <AppOverlay :percentage="20" />

    <div class="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto">
      <div
        class="flex min-h-full flex-1 items-end px-5 pt-32 pb-[calc(env(safe-area-inset-bottom)+11rem)] sm:px-8 sm:pt-36 sm:pb-[calc(env(safe-area-inset-bottom)+10rem)] md:px-10 md:pb-32 lg:px-20"
      >
        <FormContact
          class="w-full max-w-xl rounded-xl bg-black/70 p-6 sm:p-8 md:max-w-2xl md:rounded-2xl md:p-10 lg:ml-[5%]"
        />
      </div>

      <div
        class="pointer-events-none absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:inset-x-8"
      >
        <div class="border-y border-white/55 py-4 md:py-5">
          <p
            class="text-center text-xs leading-relaxed font-medium tracking-[0.16em] text-white/90 uppercase md:text-sm"
          >
            Parlons de votre projet
          </p>
        </div>

        <div
          class="pointer-events-auto mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.65rem] leading-relaxed tracking-[0.08em] text-white"
          :class="isCompactContactLayout ? 'justify-center text-center' : 'justify-start text-left'"
        >
          <span
            v-for="(contactLink, index) in contactLinks"
            :key="contactLink.to"
            class="inline-flex items-center gap-3"
          >
            <span
              v-if="shouldShowContactSeparator(index)"
              class="text-white/60 max-lg:hidden"
              aria-hidden="true"
            >
              •
            </span>

            <ULink :to="contactLink.to" class="text-white transition hover:text-white">
              {{ contactLink.label }}
            </ULink>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Imports

// 2. Types et constantes statiques
type ContactInfoLink = {
  label: string
  to: string
}

const SCREEN_ID = 'screen-contact'
const backgroundImageUrl = '/images/contact-essaouira-port-mouette.jpeg'
const columnTemplate: ScreenColumnTemplate = 'single'

// 3. Props et emits

// 4. Composables, stores, routeur
const appConfig = useAppConfig()
const { setScreenMeta } = useScreenSystem()
const { isMobilePortrait, isTabletPortrait } = useDeviceDetect()

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready
const contactEmails = computed(() => appConfig.organization.email)
const contactPhoneEntries = computed(() =>
  getOrganizationPhoneEntries(appConfig.organization.phoneNumbers ?? []),
)

const contactLinks = computed<ContactInfoLink[]>(() => [
  ...contactEmails.value.map((email) => ({
    label: email,
    to: `mailto:${email}`,
  })),
  ...contactPhoneEntries.value.map((phoneEntry) => ({
    label: `${phoneEntry.label} ${phoneEntry.phone}`,
    to: phoneEntry.href,
  })),
])

const isCompactContactLayout = computed<boolean>(
  () => isMobilePortrait.value || isTabletPortrait.value,
)

// 9. Actions et handlers
const shouldShowContactSeparator = (index: number): boolean => {
  return index > 0
}

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
onMounted(() => {
  setScreenMeta(SCREEN_ID, {
    type: 'standard',
    logo: {
      visible: true,
    },
    layout: {
      column: columnTemplate,
      contentZone: 'none',
      imageZone: 'background',
      hasBackgroundImage: true,
      backgroundImage: backgroundImageUrl,
    },
  })
})
</script>
