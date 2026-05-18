<template>
  <div
    class="bg-background fixed inset-0 flex w-screen items-center justify-center text-center transition-opacity duration-500 ease-out"
    :class="isLandingShellVisible ? 'z-100 opacity-100' : 'pointer-events-none z-100 opacity-0'"
    role="status"
    aria-live="polite"
    aria-busy="true"
    :aria-label="props.ariaLabel"
  >
    <LogoMlkFull
      class="-mt-24 transition-opacity duration-500 ease-out md:mt-0"
      :class="isLandingShellVisible ? 'opacity-100' : 'opacity-0'"
      size="5xl"
      :force-visible="true"
      :color-class="resolvedLogoColorClass"
      :aria-label="props.logoAriaLabel"
    />
  </div>
</template>

<script setup lang="ts">
// 2. Types et constantes statiques

// Doit correspondre à la durée `duration-500` de la transition CSS de sortie.
const LANDING_SHELL_EXIT_DURATION_MS = 500

// 3. Props et emits
const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    logoAriaLabel?: string
    logoColorClass?: string
  }>(),
  {
    ariaLabel: 'Chargement initial de l application',
    logoAriaLabel: 'MLK - My Little Kasbah',
    logoColorClass: 'text-surface',
  },
)

// 4. Composables, stores, routeur

const logger = useLogger({ module: 'app-boot-shell' })
const { isLandingShellVisible } = useApp()
const { initCoreDataStatus, isInitCoreDataReady } = useNuxtServerInit()

// 5. Etat local

// Référence au timer de complétion : permet d'annuler le délai si l'état redevient visible.
let completionTimer: ReturnType<typeof setTimeout> | null = null
// Partagé avec app.vue via useState : signal de fin de vie du shell pour la session courante.
const hasLandingShellCompleted = useState<boolean>('app.boot-shell.completed', () => false)
// Accès direct pour le logging : même clé que FullImage.vue.
const isHeroImageReady = useState<boolean>('screen.real-estate-full-image.hero-ready', () => false)

// 8. Computed UI-ready
const resolvedLogoColorClass = computed(
  () => props.logoColorClass as 'text-foreground/90' | 'text-white/90' | undefined,
)

// 10. Watch et watchEffect

// Orchestre le cycle de vie du shell.
// Quand isLandingShellVisible passe à false, démarre un timer égal à la durée
// de la transition CSS avant de signaler la complétion à app.vue (démontage du v-if).
// Le double-check (nextTick + vérification finale) évite de déclencher la complétion
// sur des oscillations rapides de l'état.
watch(
  isLandingShellVisible,
  async (visible) => {
    logger.info('boot-shell:visibility-change', {
      visible,
      isHeroImageReady: isHeroImageReady.value,
      isInitCoreDataReady: isInitCoreDataReady.value,
      initCoreDataStatus: initCoreDataStatus.value,
      hasLandingShellCompleted: hasLandingShellCompleted.value,
    })

    // Protège l'accès au DOM et aux timers : client-only.
    // Requis pour la compatibilité SSR.
    if (import.meta.server) return
    if (completionTimer) {
      clearTimeout(completionTimer)
      completionTimer = null
    }

    // Pas de complétion si le shell est encore visible ou si l'init n'est pas terminée.
    if (visible || initCoreDataStatus.value === 'loading') return

    await nextTick()

    if (!isLandingShellVisible.value) {
      completionTimer = setTimeout(() => {
        // Vérification finale : annule si l'état est redevenu visible pendant le délai.
        if (!isLandingShellVisible.value) {
          logger.info('boot-shell:completed', {
            isHeroImageReady: isHeroImageReady.value,
          })
          hasLandingShellCompleted.value = true
        }

        completionTimer = null
      }, LANDING_SHELL_EXIT_DURATION_MS)
    }
  },
  { immediate: true },
)

// 12. Lifecycle

onUnmounted(() => {
  // Nettoyage défensif : évite une mise à jour de state sur un composant démonté.
  if (completionTimer) {
    clearTimeout(completionTimer)
    completionTimer = null
  }
})
</script>
