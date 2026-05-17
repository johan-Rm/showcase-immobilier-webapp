<template>
  <!-- Desktop : slideover gauche -->
  <USlideover
    :open="isDesktopOpen"
    side="left"
    :ui="{
      content:
        'max-w-[min(92vw,34rem)] bg-[#212121] text-white ring-0 sm:ring-0 shadow-none sm:shadow-none',
      overlay: 'bg-black/95',
    }"
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
      </div>
    </template>
  </USlideover>

  <!-- Mobile : bottom bar (lg:hidden) -->
  <div
    v-if="accommodation"
    class="fixed right-0 bottom-0 left-0 z-30 flex flex-col bg-[#212121] lg:hidden"
  >
    <div
      v-if="isOpen"
      class="flex max-h-[78vh] min-h-0 flex-col overflow-hidden border-t border-white/10"
    >
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
        @update:active-section="activeSection = $event"
        @update:active-locale="activeLocale = $event"
        @toggle-block="toggleBlock"
        @update-field="updateField"
        @update-body="updateBody"
        @update-associated-media="updateAssociatedMedia"
        @update-media-image="updateMediaImage"
      />
    </div>

    <!-- Handle (toujours visible en bas) -->
    <button
      type="button"
      class="flex items-center gap-3 border-t border-white/10 px-4 py-3"
      :aria-label="isOpen ? 'Réduire l\'éditeur' : 'Ouvrir l\'éditeur'"
      @click="isOpen = !isOpen"
    >
      <UIcon name="i-lucide-square-pen" class="shrink-0 text-white/35" aria-hidden="true" />
      <span class="flex-1 truncate text-sm font-medium text-white/55">
        {{ accommodation.preview.title }}
      </span>
      <UIcon
        :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
        class="shrink-0 text-white/30"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import type {
  DashboardAccommodation,
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

type DashboardLocale = 'fr' | 'en' | 'es'
type EditorSection = 'content' | 'media'
type DashboardDraft = { frontmatter: DashboardEditableRecord; body: string }
type BlockMenuItem = { label: string; icon?: string; onSelect?: () => void }

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

const isDesktopOpen = computed<boolean>(() => isOpen.value && !isMobile.value)

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

const propertyMenuItems = computed<BlockMenuItem[][]>(() => [
  [{ label: 'Voir sur le site', icon: 'i-lucide-external-link', onSelect: () => {} }],
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

watch(
  () => props.accommodation?.slug,
  () => {
    drafts.value = createDrafts(props.accommodation)
    activeSection.value = 'content'
    activeLocale.value = 'fr'
    expandedBlocks.value = new Set(['body'])
  },
  { immediate: true },
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
</script>
