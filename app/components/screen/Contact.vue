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
      :width="IMAGE_PRESETS.fullscreenCover.width"
      :format="IMAGE_PRESETS.fullscreenCover.format"
      :quality="IMAGE_PRESETS.fullscreenCover.quality"
      :fit="IMAGE_PRESETS.fullscreenCover.fit"
      :sizes="IMAGE_PRESETS.fullscreenCover.sizes"
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
          ref="contactLineRef"
          class="pointer-events-auto mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.65rem] leading-relaxed tracking-[0.08em] text-white"
          :class="
            isMobilePortrait || isTabletPortrait
              ? 'justify-center text-center'
              : 'justify-start text-left'
          "
        >
          <span
            v-for="(contactLink, index) in contactLinks"
            :key="contactLink.to"
            data-contact-link
            class="inline-flex items-center gap-3"
          >
            <span v-if="shouldShowContactSeparator(index)" class="text-white/60" aria-hidden="true">
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
import type { ScreenColumnTemplate } from '#shared/types/screenNavigator'

import { IMAGE_PRESETS } from '~/composables/useAppImage'
type ContactInfoLink = {
  label: string
  to: string
}

const SCREEN_ID = 'screen-contact'
const backgroundImageUrl = '/images/contact-essaouira-port-mouette.jpeg'
const columnTemplate: ScreenColumnTemplate = 'single'

const appConfig = useAppConfig()
const { setScreenMeta } = useScreenSystem()
const { isMobilePortrait, isTabletPortrait } = useDeviceDetect()

const contactLineRef = ref<HTMLElement | null>(null)
const wrappedContactLinkIndexes = ref<Set<number>>(new Set())

let contactResizeObserver: ResizeObserver | null = null

const contactEmail = computed(() => appConfig.organization.email)
const contactPhoneEntries = computed(() =>
  getOrganizationPhoneEntries(appConfig.organization.phoneNumbers ?? []),
)

const contactLinks = computed<ContactInfoLink[]>(() => [
  {
    label: contactEmail.value,
    to: `mailto:${contactEmail.value}`,
  },
  ...contactPhoneEntries.value.map((phoneEntry) => ({
    label: `${phoneEntry.label} ${phoneEntry.phone}`,
    to: phoneEntry.href,
  })),
])

const shouldShowContactSeparator = (index: number): boolean => {
  return index > 0 && !wrappedContactLinkIndexes.value.has(index)
}

const updateContactSeparators = async (): Promise<void> => {
  await nextTick()

  const container = contactLineRef.value
  if (!container) {
    return
  }

  const items = Array.from(container.querySelectorAll<HTMLElement>('[data-contact-link]'))
  const nextWrappedIndexes = new Set<number>()

  items.forEach((item, index) => {
    if (index === 0) {
      return
    }

    const previousItem = items[index - 1]

    if (previousItem && item.offsetTop > previousItem.offsetTop) {
      nextWrappedIndexes.add(index)
    }
  })

  wrappedContactLinkIndexes.value = nextWrappedIndexes
}

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

  updateContactSeparators()

  if (contactLineRef.value) {
    contactResizeObserver = new ResizeObserver(() => {
      updateContactSeparators()
    })

    contactResizeObserver.observe(contactLineRef.value)
  }
})

onBeforeUnmount(() => {
  contactResizeObserver?.disconnect()
})
</script>
