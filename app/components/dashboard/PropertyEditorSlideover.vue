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
        <section class="flex min-h-0 flex-1 flex-col" data-property-editor-process="edit">
          <DashboardPropertyEditorPanel
            :active-section="activeSection"
            :active-locale="activeLocale"
            :active-draft="activeDraft"
            :accommodation="accommodation"
            :expanded-blocks="expandedBlocks"
            :title-value="titleDraftValue"
            :associated-media-value="associatedMediaValue"
            :property-menu-items="propertyMenuItems"
            :place-name="placeName"
            :place-text="placeText"
            :place-text-status="placeTextStatus"
            :place-text-error-message="placeTextErrorMessage"
            :is-place-text-dirty="isPlaceTextDirty"
            :symfony-available="symfonyAvailable"
            :is-active-value="isActiveValue"
            :save-status="saveStatus"
            :save-error-message="saveErrorMessage"
            :save-markdown-updated="saveMarkdownUpdated"
            show-close
            @update:active-section="activeSection = $event"
            @update:active-locale="activeLocale = $event"
            @close="isOpen = false"
            @toggle-block="toggleBlock"
            @update-field="updateField"
            @update-body="updateBody"
            @update-associated-media="updateAssociatedMedia"
            @update-place-text="updatePlaceText"
            @save="handleSave"
          />
        </section>

        <section data-property-editor-process="create" aria-hidden="true" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useDashboardPlaceText } from '~/composables/dashboard/useDashboardPlaceText'
import { useDashboardSave } from '~/composables/dashboard/useDashboardSave'
import { useSymfonyStatus } from '~/composables/dashboard/useSymfonyStatus'

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
  saved: []
}>()

const activeSection = ref<EditorSection>('content')
const activeLocale = ref<DashboardLocale>('fr')
const drafts = ref<Record<DashboardLocale, DashboardDraft> | null>(null)
const dirtyLocalizedFields = ref<
  Record<DashboardLocale, Set<DashboardLocalizedAccommodationField>>
>({
  fr: new Set(),
  en: new Set(),
  es: new Set(),
})
const expandedBlocks = ref<Set<string>>(new Set<string>())
const isMobile = ref(false)
const localeLoadToken = ref(0)
const skipNextLocaleLoad = ref(false)

const {
  status: saveStatus,
  errorMessage: saveErrorMessage,
  markdownUpdated: saveMarkdownUpdated,
  freshAccommodation: savedFreshAccommodation,
  freshTranslations: savedFreshTranslations,
  saveMultilingual,
  reset: resetSave,
} = useDashboardSave()
const {
  placeName,
  placeText,
  status: placeTextStatus,
  errorMessage: placeTextErrorMessage,
  isDirty: isPlaceTextDirty,
  loadPlaceText,
  updatePlaceText,
  savePlaceText,
} = useDashboardPlaceText()
const { available: symfonyAvailable, check: checkSymfonyStatus } = useSymfonyStatus()
const { enabledLocales, sourceLocale: projectSourceLocale } = useProjectLocales()

const slideroverUi = computed(() =>
  isMobile.value
    ? {
        content: 'max-h-[82dvh] bg-[#212121] text-white ring-0 shadow-none',
        overlay: 'bg-black/55',
      }
    : {
        content:
          'max-w-[min(92vw,34rem)] bg-[#212121] text-white ring-0 sm:ring-0 shadow-none sm:shadow-none',
        overlay: 'bg-black/55',
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

const localizedFieldSet = new Set<string>(DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS)
// Onglets limites aux locales activees du projet (les drafts restent indexes
// sur le catalogue complet, voir createDrafts).
const localeTabs: DashboardLocale[] = enabledLocales.value.map((locale) => locale.code)

const isDashboardLocale = (value: string | undefined): value is DashboardLocale =>
  value === 'fr' || value === 'en' || value === 'es'

const createDirtyState = (): Record<
  DashboardLocale,
  Set<DashboardLocalizedAccommodationField>
> => ({
  fr: new Set(),
  en: new Set(),
  es: new Set(),
})

const isLocalizedField = (path: string): path is DashboardLocalizedAccommodationField =>
  localizedFieldSet.has(path)

const normalizeRelationCode = (
  value: DashboardEditableValue | undefined,
  fallback: string,
): DashboardEditableValue => {
  if (typeof value === 'string' && value.trim()) return value
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as DashboardEditableRecord
    if (typeof record.slug === 'string' && record.slug.trim()) return record.slug
    if (typeof record.codeValue === 'string' && record.codeValue.trim()) return record.codeValue
  }
  return fallback || null
}

const withPreviewFallbacks = (accommodation: DashboardAccommodation): DashboardEditableRecord => {
  const frontmatter = cloneEditableRecord(accommodation.frontmatter)
  frontmatter.realEstateListing = normalizeRelationCode(
    frontmatter.realEstateListing,
    accommodation.preview.listingSlug,
  )
  frontmatter.category = normalizeRelationCode(
    frontmatter.category,
    accommodation.preview.categorySlug,
  )
  frontmatter.place = normalizeRelationCode(frontmatter.place, accommodation.preview.placeSlug)
  return frontmatter
}

const createDraftFromAccommodation = (accommodation: DashboardAccommodation): DashboardDraft => ({
  frontmatter: withPreviewFallbacks(accommodation),
  body: accommodation.body ?? '',
})

const createDraftFromTranslation = (
  accommodation: DashboardAccommodation,
  translation: DashboardAccommodationTranslationPayload,
): DashboardDraft => {
  let frontmatter = withPreviewFallbacks(accommodation)
  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.forEach((field) => {
    if (field === 'body' || !Object.hasOwn(translation, field)) return
    frontmatter = setNestedValue(frontmatter, field, translation[field] ?? null)
  })

  return {
    frontmatter,
    body: translation.body ?? '',
  }
}

const createFallbackDraft = (accommodation?: DashboardAccommodation | null): DashboardDraft => {
  const frontmatter = accommodation ? withPreviewFallbacks(accommodation) : {}
  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.forEach((field) => {
    frontmatter[field] = ''
  })
  return { frontmatter, body: '' }
}

const createDrafts = (
  accommodation?: DashboardAccommodation | null,
): Record<DashboardLocale, DashboardDraft> => {
  const sourceLocale = isDashboardLocale(accommodation?.locale)
    ? accommodation.locale
    : projectSourceLocale.value
  const fallback = createFallbackDraft(accommodation)
  const result: Record<DashboardLocale, DashboardDraft> = {
    fr: { frontmatter: cloneEditableRecord(fallback.frontmatter), body: fallback.body },
    en: { frontmatter: cloneEditableRecord(fallback.frontmatter), body: fallback.body },
    es: { frontmatter: cloneEditableRecord(fallback.frontmatter), body: fallback.body },
  }

  if (accommodation) {
    result[sourceLocale] = createDraftFromAccommodation(accommodation)
  }

  return result
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

const isActiveValue = computed<boolean>(() =>
  Boolean(getNestedValue(activeDraft.value?.frontmatter ?? {}, 'isActive')),
)

const activePlaceCode = computed<string | null>(() => {
  const value = getNestedValue(activeDraft.value?.frontmatter ?? {}, 'place')
  return typeof value === 'string' && value.trim() ? value : null
})

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
  const nextValue = cloneEditableValue(value)

  if (isLocalizedField(path)) {
    drafts.value[locale].frontmatter = setNestedValue(
      drafts.value[locale].frontmatter,
      path,
      nextValue,
    )
    dirtyLocalizedFields.value[locale].add(path)
    return
  }

  localeTabs.forEach((draftLocale) => {
    drafts.value![draftLocale].frontmatter = setNestedValue(
      drafts.value![draftLocale].frontmatter,
      path,
      nextValue,
    )
  })
}

const updateBody = (value: string): void => {
  if (!drafts.value) return
  drafts.value[activeLocale.value].body = value
  dirtyLocalizedFields.value[activeLocale.value].add('body')
}

const updateAssociatedMedia = (value: DashboardEditableValue): void => {
  if (!drafts.value) return
  const cloned = cloneEditableValue(value)
  localeTabs.forEach((locale) => {
    if (drafts.value![locale]) {
      drafts.value![locale].frontmatter.associatedMedia = cloned
    }
  })
}

const saveActivePlaceText = async (): Promise<boolean> => {
  return savePlaceText(activePlaceCode.value, activeLocale.value)
}

const toTranslationValue = (
  draft: DashboardDraft,
  field: DashboardLocalizedAccommodationField,
): string | null => {
  if (field === 'body') return draft.body
  const value = getNestedValue(draft.frontmatter, field)
  return typeof value === 'string' ? value : null
}

const buildTranslations = (): DashboardAccommodationTranslationPayload[] => {
  if (!drafts.value) return []

  return localeTabs
    .map((locale): DashboardAccommodationTranslationPayload | null => {
      const fields = dirtyLocalizedFields.value[locale]
      if (fields.size === 0) return null

      const translation: DashboardAccommodationTranslationPayload = { locale }
      fields.forEach((field) => {
        translation[field] = toTranslationValue(drafts.value![locale], field)
      })
      return translation
    })
    .filter((translation): translation is DashboardAccommodationTranslationPayload =>
      Boolean(translation),
    )
}

const buildActiveLocaleTranslation = (): DashboardAccommodationTranslationPayload | null => {
  if (!activeDraft.value) return null

  const translation: DashboardAccommodationTranslationPayload = { locale: activeLocale.value }
  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.forEach((field) => {
    translation[field] = toTranslationValue(activeDraft.value!, field)
  })
  return translation
}

const ensureTranslations = (
  translations: DashboardAccommodationTranslationPayload[],
): DashboardAccommodationTranslationPayload[] => {
  if (translations.length > 0) return translations

  const activeTranslation = buildActiveLocaleTranslation()
  return activeTranslation ? [activeTranslation] : []
}

const resolveSaveLocale = (
  translations: DashboardAccommodationTranslationPayload[],
): LocaleCode => {
  return translations.length > 1
    ? projectSourceLocale.value
    : (translations[0]?.locale ?? activeLocale.value)
}

const loadLocaleDrafts = async (accommodation?: DashboardAccommodation | null): Promise<void> => {
  if (!accommodation) return

  const token = localeLoadToken.value + 1
  localeLoadToken.value = token

  let translations: DashboardAccommodationTranslationPayload[] = []
  try {
    const response = await $fetch<DashboardAccommodationTranslationsResponse>(
      `/api/dashboard/accommodations/${encodeURIComponent(accommodation.identifier)}/translations`,
    )
    translations = response.translations
  } catch {
    translations = []
  }

  if (localeLoadToken.value !== token || !drafts.value) return

  translations.forEach((translation) => {
    const locale = translation.locale
    if (!isDashboardLocale(locale)) return
    if (dirtyLocalizedFields.value[locale].size > 0) return
    drafts.value![locale] = createDraftFromTranslation(accommodation, translation)
  })
}

const handleSave = async (): Promise<void> => {
  if (!props.accommodation || !activeDraft.value) return

  const placeSaved = await saveActivePlaceText()
  if (!placeSaved) return

  const translations = ensureTranslations(buildTranslations())
  const payload: DashboardAccommodationSavePayload = {
    ...props.accommodation,
    locale: activeLocale.value,
    frontmatter: activeDraft.value.frontmatter,
    body: activeDraft.value.body,
    ...(translations.length > 0 && { translations }),
  }

  const ok = await saveMultilingual(payload, resolveSaveLocale(translations))
  if (ok) {
    dirtyLocalizedFields.value = createDirtyState()
    const fresh = savedFreshAccommodation.value
    if (fresh) {
      drafts.value = createDrafts(fresh)
      savedFreshTranslations.value.forEach((translation) => {
        const locale = translation.locale
        if (!isDashboardLocale(locale)) return
        drafts.value![locale] = createDraftFromTranslation(fresh, translation)
      })
      skipNextLocaleLoad.value = true
    }
    emit('saved')
  }
}

watch(
  () => props.accommodation?.slug,
  async () => {
    drafts.value = createDrafts(props.accommodation)
    dirtyLocalizedFields.value = createDirtyState()
    activeSection.value = 'content'
    activeLocale.value = isDashboardLocale(props.accommodation?.locale)
      ? props.accommodation.locale
      : projectSourceLocale.value
    expandedBlocks.value = new Set<string>()
    resetSave()
    if (skipNextLocaleLoad.value) {
      skipNextLocaleLoad.value = false
      return
    }
    if (isOpen.value) {
      await loadLocaleDrafts(props.accommodation)
    }
  },
  { immediate: true },
)

watch(isOpen, async (open) => {
  if (!open) {
    expandedBlocks.value = new Set<string>()
    return
  }
  if (open && symfonyAvailable.value === null) {
    checkSymfonyStatus()
  }
  await loadLocaleDrafts(props.accommodation)
})

watch(
  [activePlaceCode, activeLocale],
  async ([placeCode, locale]) => {
    await loadPlaceText(placeCode, locale)
  },
  { immediate: true },
)
</script>
