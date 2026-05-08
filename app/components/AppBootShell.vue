<template>
  <div
    class="bg-background fixed inset-0 flex w-screen items-center justify-center text-center transition-opacity duration-500 ease-out"
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
// 1. Imports

// 2. Types et constantes statiques

// 3. Props et emits
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

// 4. Composables, stores, routeur

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready
const resolvedLogoColorClass = computed(
  () => props.logoColorClass as 'text-foreground/90' | 'text-white/90' | undefined,
)

// 9. Actions et handlers

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
