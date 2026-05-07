<template>
  <div class="card-invest w-full">
    <div
      class="relative overflow-hidden rounded-4xl bg-linear-to-br from-black/70 via-black/60 to-black/45 p-4 py-6 md:p-6 md:py-10 2xl:p-12 2xl:py-16"
    >
      <div class="space-y-4 md:space-y-6">
        <div class="flex items-center gap-4">
          <span class="block h-px w-8 bg-white" />
          <p
            v-if="props.sectionLabel"
            class="text-background/70 text-sm tracking-[0.24em] uppercase"
          >
            {{ props.sectionLabel }}
          </p>
        </div>

        <HeadingH3 v-if="props.sectionTitle" hide-line size="2xl">
          {{ props.sectionTitle }}
        </HeadingH3>

        <div v-if="!isPhoneLandscape" class="max-w-xl space-y-4 text-white/80 xl:max-w-2xl">
          <p class="text-justify md:text-left">
            {{ props.sectionParagraphs }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <NuxtLink
            v-if="props.primaryLink"
            :to="props.primaryLink.to"
            class="bg-background hover:text-background/90 inline-flex items-center justify-center rounded-xl px-4 py-2 tracking-[0.08em] text-white uppercase hover:bg-white/90"
          >
            {{ props.primaryLink.label }}
          </NuxtLink>

          <NuxtLink
            v-if="props.secondaryLink"
            :to="props.secondaryLink.to"
            class="inline-flex items-center justify-center font-semibold text-white/90 underline decoration-white/90 underline-offset-4 transition hover:text-white hover:decoration-white"
          >
            {{ props.secondaryLink.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type CardInvestLink = {
  label: string
  to: string
}

type CardInvestProps = {
  sectionLabel?: string
  sectionTitle?: string
  sectionParagraphs: string
  primaryLink?: CardInvestLink | null
  secondaryLink?: CardInvestLink | null
}

const props = defineProps<CardInvestProps>()
const { isPhoneDevice, isLandscape } = useDeviceDetect()
const isPhoneLandscape = computed<boolean>(() => isPhoneDevice.value && isLandscape.value)
</script>
