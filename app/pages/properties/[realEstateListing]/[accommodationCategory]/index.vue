<template>
  <UPage ref="pageRef" :ui="screenUi.page">
    <!-- Liste de catégorie : les filtres viennent des paramètres dynamiques de route. -->
    <UPageSection data-screen="screen-property-list" :ui="screenUi.pageSection">
      <ScreenPropertyList :total-count="accommodations.length" />
    </UPageSection>

    <!-- Relance immobilière standard pour maintenir l'exploration après la liste filtrée. -->
    <UPageSection data-screen="screen-real-estate-three-col-properties" :ui="screenUi.pageSection">
      <LazyScreenRealEstateThreeColProperties />
    </UPageSection>

    <!-- Footer commun avec les informations de contact et de confiance. -->
    <UPageSection data-screen="screen-footer" :ui="screenUi.pageSection">
      <LazyScreenFooter />
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
// Page SEO volontairement absente pour l'instant : le composable reçoit les biens filtrés
// sans inventer de contenu éditorial non disponible pour cette route.
const page = computed(() => null)
// Conteneur racine utilisé pour scoper la navigation plein écran.
const pageRef = ref<HTMLElement | null>(null)
// Logger de diagnostic local à cette route dynamique.
const logger = useLogger({ module: 'page-properties-category-index' })

// Transition partagée par les parcours verticaux de propriétés.
const transitionMode = 'cross-zoom'

const { screenUi } = useScreenSystem({
  // Parcours vertical : liste filtrée, relance, footer.
  axis: 'y',
  // Pas de boucle afin de garder une progression lisible.
  loop: false,
  // Navigation clavier disponible sur desktop.
  keyboard: true,
  // Active les transitions automatiques prévues par le système d'écrans.
  auto: true,
  // Swipe mobile avec seuil franc pour éviter les changements accidentels.
  touch: true,
  touchThreshold: 60,
  // Temporise les gestes tactiles pendant les transitions.
  touchCooldownMs: 700,
  // Priorise la navigation par section sur le scroll natif.
  touchPreventScroll: true,
  // Wheel desktop adaptée à un parcours vertical.
  wheel: true,
  wheelThreshold: 40,
  // Limite les doubles déclenchements sur trackpads.
  wheelCooldownMs: 300,
  container: pageRef,
  transitionMode,
  anchors: {
    // Les sections restent adressables sans ajouter de routes enfants.
    enabled: true,
    // Synchronisation du hash réservée aux navigations explicites.
    syncMode: 'explicit-only',
    // Nettoie les ancres devenues obsolètes après une navigation implicite.
    clearHashOnImplicitNavigation: true,
  },
})

const route = useRoute()
const accommodationStore = useAccommodationStore()
// Normalise le segment de type de bien pour alimenter le filtre store.
const realEstateListingSlug = computed(() => {
  const raw = route.params.realEstateListing
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})
// Normalise le segment de catégorie pour éviter les comparaisons directes sur le paramètre brut.
const accommodationCategorySlug = computed(() => {
  const raw = route.params.accommodationCategory
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})
// Données filtrées par les deux segments dynamiques de l'URL.
const accommodations = computed(() =>
  accommodationStore.getAccommodationsByRealEstateListingAndCategory(
    realEstateListingSlug.value,
    accommodationCategorySlug.value,
  ),
)

onMounted(() => {
  // Trace de diagnostic client : utile pour vérifier les routes dynamiques et les volumes filtrés.
  logger.info('Mounted page', {
    page: 'properties-category-index',
    fullPath: route.fullPath,
    realEstateListingSlug: realEstateListingSlug.value,
    accommodationCategorySlug: accommodationCategorySlug.value,
    accommodationsCount: accommodations.value.length,
  })
})

onUnmounted(() => {
  // Trace de sortie associée à la même route afin de repérer les navigations internes inattendues.
  logger.info('Unmounted page', {
    page: 'properties-category-index',
    fullPath: route.fullPath,
    realEstateListingSlug: realEstateListingSlug.value,
    accommodationCategorySlug: accommodationCategorySlug.value,
  })
})

watch(
  () => route.fullPath,
  (nextFullPath, previousFullPath) => {
    // Les paramètres dynamiques peuvent changer sans recréer immédiatement le composant.
    // Cette trace confirme que les filtres réactifs suivent bien l'URL active.
    logger.info('Route changed inside page', {
      page: 'properties-category-index',
      previousFullPath,
      nextFullPath,
      realEstateListingSlug: realEstateListingSlug.value,
      accommodationCategorySlug: accommodationCategorySlug.value,
    })
  },
)

// SEO basé sur les biens filtrés ; la page éditoriale reste nulle tant qu'aucun contenu dédié n'existe.
usePageSeo(page, accommodations)
</script>
