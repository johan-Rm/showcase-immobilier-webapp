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
          :property-menu-items="propertyMenuItems"
          show-close
          @update:active-section="activeSection = $event"
          @update:active-locale="activeLocale = $event"
          @close="isOpen = false"
          @toggle-block="toggleBlock"
          @update-field="updateField"
          @update-body="updateBody"
          @update-associated-media="updateAssociatedMedia"
        />

        <!-- Barre de sauvegarde -->
        <div class="shrink-0 border-t border-white/10 bg-[#1a1a1a] px-4 py-3">
          <!-- Statut API + isActive -->
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span
                class="inline-block h-2 w-2 rounded-full"
                :class="{
                  'bg-green-500': symfonyAvailable === true,
                  'bg-red-500': symfonyAvailable === false,
                  'animate-pulse bg-white/30': symfonyAvailable === null,
                }"
              />
              <span class="text-xs text-white/40">
                <template v-if="symfonyAvailable === null">Vérification API…</template>
                <template v-else-if="symfonyAvailable">API disponible</template>
                <template v-else>API indisponible</template>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-white/20">Actif</span>
              <USwitch
                :model-value="isActiveValue"
                :ui="{
                  base: 'data-[state=checked]:bg-[#6B7A4A] data-[state=unchecked]:bg-red-500/30',
                }"
                @update:model-value="updateField('isActive', $event)"
              />
            </div>
          </div>

          <!-- Message d'erreur sauvegarde -->
          <p v-if="saveStatus === 'error'" class="mb-2 text-xs text-red-400">
            {{ saveErrorMessage ?? 'Erreur lors de la sauvegarde' }}
          </p>

          <!-- Avertissement markdown non mis à jour -->
          <p
            v-if="saveStatus === 'success' && saveMarkdownUpdated === false"
            class="mb-2 text-xs text-amber-400"
          >
            Sauvegarde BDD réussie — fichier local non mis à jour
          </p>

          <!-- Bouton Enregistrer -->
          <UButton
            block
            :disabled="saveStatus === 'saving' || !accommodation || symfonyAvailable === false"
            :loading="saveStatus === 'saving'"
            :color="saveStatus === 'error' ? 'error' : 'primary'"
            :variant="saveStatus === 'success' ? 'soft' : 'solid'"
            :class="[
              'font-medium',
              saveStatus !== 'error' ? 'bg-[#6B7A4A]! hover:bg-[#5c6940]!' : '',
            ]"
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
  DashboardAccommodationSavePayload,
  DashboardAccommodationTranslationPayload,
  DashboardAccommodationTranslationsResponse,
  DashboardEditableRecord,
  DashboardEditableValue,
  DashboardLocalizedAccommodationField,
} from '#shared/types/dashboardAccommodation'
import type { LocaleCode } from '#shared/types/i18n'

import { useDashboardSave } from '~/composables/dashboard/useDashboardSave'
import { useSymfonyStatus } from '~/composables/dashboard/useSymfonyStatus'

import { DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS } from '#shared/types/dashboardAccommodation'

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
const expandedBlocks = ref<Set<string>>(new Set(['body']))
const isMobile = ref(false)
const localeLoadToken = ref(0)

const {
  status: saveStatus,
  errorMessage: saveErrorMessage,
  markdownUpdated: saveMarkdownUpdated,
  saveMultilingual,
  reset: resetSave,
} = useDashboardSave()
const { available: symfonyAvailable, check: checkSymfonyStatus } = useSymfonyStatus()

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
const localeTabs: DashboardLocale[] = ['fr', 'en', 'es']

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

const createDraftFromAccommodation = (accommodation: DashboardAccommodation): DashboardDraft => ({
  frontmatter: cloneEditableRecord(accommodation.frontmatter),
  body: accommodation.body ?? '',
})

const createDraftFromTranslation = (
  accommodation: DashboardAccommodation,
  translation: DashboardAccommodationTranslationPayload,
): DashboardDraft => {
  let frontmatter = cloneEditableRecord(accommodation.frontmatter)
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
  const frontmatter = accommodation ? cloneEditableRecord(accommodation.frontmatter) : {}
  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.forEach((field) => {
    frontmatter[field] = ''
  })
  return { frontmatter, body: '' }
}

const createDrafts = (
  accommodation?: DashboardAccommodation | null,
): Record<DashboardLocale, DashboardDraft> => {
  const sourceLocale = isDashboardLocale(accommodation?.locale) ? accommodation.locale : 'fr'
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
  drafts.value[activeLocale.value].frontmatter.associatedMedia = cloneEditableValue(value)
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
  return translations.length > 1 ? 'fr' : (translations[0]?.locale ?? activeLocale.value)
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
      : 'fr'
    expandedBlocks.value = new Set(['body'])
    resetSave()
    if (isOpen.value) {
      await loadLocaleDrafts(props.accommodation)
    }
  },
  { immediate: true },
)

watch(isOpen, async (open) => {
  if (open && symfonyAvailable.value === null) {
    checkSymfonyStatus()
  }
  if (open) {
    await loadLocaleDrafts(props.accommodation)
  }
})
</script>
