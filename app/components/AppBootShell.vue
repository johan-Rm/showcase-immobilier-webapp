<template>
  <div
    class="bg-background fixed inset-0 flex w-screen items-center justify-center text-center"
    :class="props.overlayClass"
    role="status"
    aria-live="polite"
    aria-busy="true"
    :aria-label="props.ariaLabel"
  >
    <LogoMlkFull
      class="-mt-24 transition-opacity duration-500 ease-out md:mt-0"
      :class="props.logoClass"
      size="5xl"
      :force-visible="true"
      :color-class="resolvedLogoColorClass"
      :aria-label="props.logoAriaLabel"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    logoAriaLabel?: string
    logoClass?: string
    logoColorClass?: string
    overlayClass?: string
  }>(),
  {
    ariaLabel: 'Chargement initial de l application',
    logoAriaLabel: 'MLK - My Little Kasbah',
    logoClass: '',
    logoColorClass: 'text-surface',
    overlayClass: '',
  },
)

const resolvedLogoColorClass = computed(
  () => props.logoColorClass as 'text-foreground/90' | 'text-white/90' | undefined,
)
</script>
