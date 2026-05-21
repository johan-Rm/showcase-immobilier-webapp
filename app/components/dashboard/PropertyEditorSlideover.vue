<template>
  <!-- Desktop : slideover gauche -->
  <USlideover
    :open="isOpen"
    :side="isMobile ? 'bottom' : 'left'"
    :ui="slideroverUi"
    @update:open="isOpen = $event"
  >
    <template #content>
      <div class="flex h-dvh min-h-0 flex-col">
        <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />
        <DashboardPropertyEditorPanel
          :active-section="activeSection"
          :active-locale="activeLocale"
          :active-draft="activeDraft"
          :accommodation="accommodation"
          :expanded-blocks="expandedBlocks"
          :title-value="titleDraftValue"
          :associated-media-value="associatedMediaValue"
          :media-image-value="mediaImageValue"
          :property-menu-items="propertyMenuItems"
          show-close
          @update:active-section="activeSection = $event"
          @update:active-locale="activeLocale = $event"
          @close="isOpen = false"
          @toggle-block="toggleBlock"
          @update-field="updateField"
          @update-body="updateBody"
          @update-associated-media="updateAssociatedMedia"
          @update-media-image="updateMediaImage"
        />

        <!-- Barre de sauvegarde -->
        <div class="shrink-0 border-t border-white/10 bg-[#1a1a1a] px-4 py-3">
          <!-- Badges locale (stub traduction) -->
          <div class="mb-3 flex items-center gap-2">
            <span class="text-xs text-white/40">Traductions</span>
            <button
              v-for="loc in locales"
              :key="loc"
              class="rounded px-2 py-0.5 text-xs font-medium transition-colors"
              :class="
                loc === activeLocale
                  ? 'bg-[#6B7A4A] text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
              "
              @click="activeLocale = loc"
            >
              {{ loc.toUpperCase() }}
            </button>
            <button
              disabled
              class="ml-auto cursor-not-allowed rounded px-2 py-0.5 text-xs text-white/30"
              title="Traduction automatique — disponible prochainement"
            >
              Traduire
            </button>
          </div>

          <!-- Message d'erreur -->
          <p v-if="saveStatus === 'error'" class="mb-2 text-xs text-red-400">
            {{ saveErrorMessage ?? 'Erreur lors de la sauvegarde' }}
          </p>

          <!-- Bouton Enregistrer -->
          <UButton
            block
            :disabled="saveStatus === 'saving' || !accommodation"
            :loading="saveStatus === 'saving'"
            :color="saveStatus === 'error' ? 'error' : 'primary'"
            :variant="saveStatus === 'success' ? 'soft' : 'solid'"
            class="font-medium"
            @click="handleSave"
          >
            <template v-if="saveStatus === 'success'">Enregistré ✓</template>
            <template v-else-if="saveStatus === 'error'">Réessayer</template>
            <template v-else>Enregistrer</template>
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type {
  DashboardAccommodation,
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

import { useDashboardSave } from '~/composables/dashboard/useDashboardSave'

type DashboardLocale = 'fr' | 'en' | 'es'
type EditorSection = 'content' | 'media'
type DashboardDraft = { frontmatter: DashboardEditableRecord; body: string }
type BlockMenuItem = { label: string; icon?: string; onSelect?: () => void }

const locales: DashboardLocale[] = ['fr', 'en', 'es']

defineOptions({ name: 'DashboardPropertyEditorSlideover' })

const props = defineProps<{
  open: boolean
  accommodation?: DashboardAccommodation | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const activeSection = ref<EditorSection>('content')
const activeLocale = ref<DashboardLocale>('fr')
const drafts = ref<Record<DashboardLocale, DashboardDraft> | null>(null)
const expandedBlocks = ref<Set<string>>(new Set(['body']))
const isMobile = ref(false)

const { status: saveStatus, errorMessage: saveErrorMessage, save, reset: resetSave } = useDashboardSave()

const slideroverUi = computed(() =>
  isMobile.value
    ? {
        content: 'max-h-[82dvh] bg-[#212121] text-white ring-0 shadow-none',
        overlay: 'bg-black/95',
      }
    : {
        content:
          'max-w-[min(92vw,34rem)] bg-[#212121] text-white ring-0 sm:ring-0 shadow-none sm:shadow-none',
        overlay: 'bg-black/95',
      },
)

onMounted(() => {
  const mq = window.matchMedia('(max-width: 1023px)')
  isMobile.value = mq.matches
  const handler = (e: MediaQueryListEvent) => {
    isMobile.value = e.matches
  }
  mq.addEventListener('change', handler)
  onUnmounted(() => mq.removeEventListener('change', handler))
})

const cloneEditableRecord = (value: DashboardEditableRecord): DashboardEditableRecord =>
  JSON.parse(JSON.stringify(value)) as DashboardEditableRecord

const cloneEditableValue = (value: DashboardEditableValue): DashboardEditableValue =>
  JSON.parse(JSON.stringify(value)) as DashboardEditableValue

const createDrafts = (
  accommodation?: DashboardAccommodation | null,
): Record<DashboardLocale, DashboardDraft> => {
  const frontmatter = accommodation ? cloneEditableRecord(accommodation.frontmatter) : {}
  const body = accommodation?.body ?? ''
  return {
    fr: { frontmatter, body },
    en: { frontmatter: cloneEditableRecord(frontmatter), body },
    es: { frontmatter: cloneEditableRecord(frontmatter), body },
  }
}

const setNestedValue = (
  record: DashboardEditableRecord,
  path: string,
  value: DashboardEditableValue,
): DashboardEditableRecord => {
  const [first, ...rest] = path.split('.')
  if (!first) return record
  if (rest.length === 0) return { ...record, [first]: value }
  const parent = record[first]
  const parentObj =
    parent !== null && typeof parent === 'object' && !Array.isArray(parent)
      ? (parent as DashboardEditableRecord)
      : {}
  return { ...record, [first]: setNestedValue(parentObj, rest.join('.'), value) }
}

const getNestedValue = (record: DashboardEditableRecord, path: string): DashboardEditableValue => {
  const [first, ...rest] = path.split('.')
  if (!first) return null
  const current = record[first] ?? null
  if (rest.length === 0) return current
  if (current === null || typeof current !== 'object' || Array.isArray(current)) return null
  return getNestedValue(current as DashboardEditableRecord, rest.join('.'))
}

const isOpen = computed<boolean>({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const activeDraft = computed<DashboardDraft | null>(
  () => drafts.value?.[activeLocale.value] ?? null,
)

const associatedMediaValue = computed<DashboardEditableValue>(
  () => activeDraft.value?.frontmatter.associatedMedia ?? [],
)

const mediaImageValue = computed<DashboardEditableValue>(
  () => activeDraft.value?.frontmatter.image ?? [],
)

const titleDraftValue = computed<string>(() => {
  if (!activeDraft.value) return props.accommodation?.preview.title ?? 'Bien immobilier'
  const name = getNestedValue(activeDraft.value.frontmatter, 'name')
  return typeof name === 'string' && name
    ? name
    : (props.accommodation?.preview.title ?? 'Bien immobilier')
})

const router = useRouter()

const propertyMenuItems = computed<BlockMenuItem[][]>(() => [
  [
    {
      label: 'Voir sur le site',
      icon: 'i-lucide-external-link',
      // TODO: ouvrir dans un nouvel onglet quand la page publique sera stable
      onSelect: () => {
        if (!props.accommodation) return
        const { listingSlug, categorySlug, slug } = props.accommodation.preview
        router.push(`/properties/${listingSlug}/${categorySlug}/${slug}`)
      },
    },
  ],
])

const toggleBlock = (id: string): void => {
  if (expandedBlocks.value.has(id)) {
    expandedBlocks.value = new Set()
  } else {
    expandedBlocks.value = new Set([id])
  }
}

const updateField = (path: string, value: DashboardEditableValue): void => {
  if (!drafts.value) return
  const locale = activeLocale.value
  drafts.value[locale].frontmatter = setNestedValue(
    drafts.value[locale].frontmatter,
    path,
    cloneEditableValue(value),
  )
}

const updateBody = (value: string): void => {
  if (!drafts.value) return
  drafts.value[activeLocale.value].body = value
}

const updateAssociatedMedia = (value: DashboardEditableValue): void => {
  if (!drafts.value) return
  drafts.value[activeLocale.value].frontmatter.associatedMedia = cloneEditableValue(value)
}

const updateMediaImage = (value: DashboardEditableValue): void => {
  if (!drafts.value) return
  drafts.value[activeLocale.value].frontmatter.image = cloneEditableValue(value)
}

const handleSave = async (): Promise<void> => {
  if (!props.accommodation || !activeDraft.value) return

  const payload: DashboardAccommodation = {
    ...props.accommodation,
    locale: activeLocale.value,
    frontmatter: activeDraft.value.frontmatter,
    body: activeDraft.value.body,
  }

  await save(payload)
}

watch(
  () => props.accommodation?.slug,
  () => {
    drafts.value = createDrafts(props.accommodation)
    activeSection.value = 'content'
    activeLocale.value = 'fr'
    expandedBlocks.value = new Set(['body'])
    resetSave()
  },
  { immediate: true },
)
</script>
