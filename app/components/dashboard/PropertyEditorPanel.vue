<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <UTabs
      :model-value="activeSection"
      :items="sectionTabs"
      :content="false"
      variant="link"
      color="neutral"
      :ui="{
        root: 'w-full gap-0',
        list: 'border-white/10 px-2',
        indicator: 'bg-[#6B7A4A]',
        trigger:
          'data-[state=inactive]:text-white/40 hover:data-[state=inactive]:text-white/60 data-[state=active]:text-white',
      }"
      @update:model-value="emit('update:activeSection', $event as EditorSection)"
    >
      <template #list-trailing>
        <div class="ml-auto flex items-center gap-0.5 self-stretch pr-1">
          <button
            v-for="locale in localeTabs"
            :key="locale"
            type="button"
            class="rounded px-2 py-1 text-[0.65rem] font-bold uppercase transition-colors"
            :class="activeLocale === locale ? 'text-white' : 'text-white/30 hover:text-white/60'"
            :style="activeLocale === locale ? 'background-color:#6B7A4A' : ''"
            @click="emit('update:activeLocale', locale)"
          >
            {{ locale }}
          </button>
          <button
            v-if="showClose"
            type="button"
            class="ml-1 rounded p-1 text-white/30 transition-colors hover:text-white/70"
            aria-label="Fermer l'editeur"
            @click="emit('close')"
          >
            <UIcon name="i-lucide-x" class="text-sm" aria-hidden="true" />
          </button>
        </div>
      </template>
    </UTabs>

    <div class="flex shrink-0 items-center gap-2 border-b border-white/10 py-2.5 pr-3 pl-4">
      <span
        v-if="accommodation?.identifier"
        class="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wider"
        style="color: #6b7a4a; background-color: rgba(255, 255, 255, 0.07)"
        >{{ accommodation.identifier }}</span
      >
      <input
        v-if="isEditingTitle"
        ref="titleInputRef"
        type="text"
        class="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white/90 caret-white outline-none"
        :value="titleValue"
        aria-label="Modifier le nom du bien"
        @input="emit('update-field', 'name', ($event.target as HTMLInputElement).value)"
        @blur="isEditingTitle = false"
        @keydown.enter="isEditingTitle = false"
        @keydown.escape="isEditingTitle = false"
      />
      <button
        v-else
        type="button"
        class="min-w-0 flex-1 truncate text-left text-sm font-semibold text-white/70 transition-colors hover:text-white/90"
        aria-label="Modifier le nom du bien"
        @click="activateTitle"
      >
        {{ titleValue }}
      </button>
      <UDropdownMenu :items="propertyMenuItems">
        <button
          type="button"
          class="rounded p-1 text-white/30 transition-colors hover:text-white/70"
          aria-label="Actions sur le bien"
        >
          <UIcon name="i-lucide-more-vertical" class="text-sm" aria-hidden="true" />
        </button>
      </UDropdownMenu>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <template v-if="activeDraft">
        <template v-if="activeSection === 'content'">
          <div v-for="block in contentBlocks" :key="block.id" class="border-b border-white/6">
            <div class="flex items-stretch transition-colors hover:bg-white/5">
              <button
                type="button"
                class="flex flex-1 items-center gap-3 px-4 py-3 text-left"
                @click="emit('toggle-block', block.id)"
              >
                <UIcon
                  :name="block.icon"
                  class="shrink-0 text-base text-white/35"
                  aria-hidden="true"
                />
                <span class="flex-1 text-sm font-medium text-white/65">{{ block.label }}</span>
                <UIcon
                  :name="
                    expandedBlocks.has(block.id)
                      ? 'i-lucide-chevron-down'
                      : 'i-lucide-chevron-right'
                  "
                  class="shrink-0 text-xs text-white/25"
                  aria-hidden="true"
                />
              </button>
              <div class="flex items-center pr-3">
                <UDropdownMenu :items="block.actions">
                  <button
                    type="button"
                    class="rounded p-1 text-white/20 transition-colors hover:text-white/60"
                    :aria-label="`Actions ${block.label}`"
                  >
                    <UIcon name="i-lucide-more-vertical" class="text-sm" aria-hidden="true" />
                  </button>
                </UDropdownMenu>
              </div>
            </div>
            <div v-if="expandedBlocks.has(block.id)" class="px-4 pt-1 pb-5">
              <template v-if="block.id === 'frontmatter'">
                <div class="flex items-center gap-2.5 border-b border-white/5 py-2.5">
                  <span class="text-[0.65rem] font-semibold tracking-widest text-white/20">{{
                    accommodationForm?.fields['isActive'] ?? 'Actif'
                  }}</span>
                  <USwitch
                    :model-value="Boolean(getFieldValue('isActive', false))"
                    :ui="{ base: 'data-[state=checked]:bg-[#6B7A4A]' }"
                    @update:model-value="emit('update-field', 'isActive', $event)"
                  />
                </div>
                <div v-for="section in frontmatterSections" :key="section.id">
                  <div v-if="section.separator" class="mt-4 h-px bg-[#6B7A4A]/40" />
                  <div v-if="!section.hideLabel" class="sticky top-0 z-10 -mx-4 bg-[#212121] px-4">
                    <p
                      class="pt-2.5 pb-1 text-[0.6rem] font-semibold tracking-[0.12em] uppercase"
                      style="color: #6b7a4a"
                    >
                      {{ section.label }}
                    </p>
                  </div>
                  <div class="grid grid-cols-2">
                    <template v-for="field in section.fields" :key="field.key">
                      <DashboardOfferField
                        v-if="field.type === 'offer'"
                        :model-value="getFieldValue(field.key, field.default)"
                        @update:model-value="emit('update-field', field.key, $event)"
                      />
                      <DashboardAmenitySelector
                        v-else-if="field.type === 'amenity'"
                        :model-value="getFieldValue(field.key, field.default)"
                        @update:model-value="emit('update-field', field.key, $event)"
                      />
                      <DashboardQualitiesEditor
                        v-else-if="field.type === 'qualities'"
                        :model-value="getFieldValue(field.key, field.default)"
                        @update:model-value="emit('update-field', field.key, $event)"
                      />
                      <DashboardCategoryCodeSelect
                        v-else-if="
                          field.type === 'category-code' || field.type === 'category-code-multi'
                        "
                        :in-code-set="field.inCodeSet ?? ''"
                        :model-value="getFieldValue(field.key, field.default)"
                        :label="field.label"
                        :placeholder="field.label"
                        :multiple="field.type === 'category-code-multi'"
                        @update:model-value="emit('update-field', field.key, $event)"
                      />
                      <DashboardPropertyFieldEditor
                        v-else
                        :label="field.label"
                        :path="field.key"
                        :model-value="getFieldValue(field.key, field.default)"
                        :readonly="field.readonly"
                        :half="field.half"
                        @update:model-value="emit('update-field', field.key, $event)"
                      />
                    </template>
                  </div>
                </div>
              </template>
              <template v-else-if="block.id === 'body'">
                <DashboardTiptapEditor
                  :model-value="activeDraft.body"
                  @update:model-value="emit('update-body', String($event))"
                />
              </template>
              <template v-else-if="block.id === 'associated-media'">
                <DashboardPropertyFieldEditor
                  :label="accommodationForm?.fields['associatedMedia'] ?? 'Médias associés'"
                  path="associatedMedia"
                  :model-value="associatedMediaValue"
                  @update:model-value="emit('update-associated-media', $event)"
                />
              </template>
            </div>
            <div class="mx-4 h-px bg-white/5" />
          </div>
        </template>

        <template v-else>
          <DashboardPropertyMediaGallery
            :images="mediaImageValue"
            :associated-media="associatedMediaValue"
            @update:associated-media="emit('update-associated-media', $event)"
          />
        </template>
      </template>
    </div>

    <div class="flex shrink-0 items-center gap-2 border-t border-white/10 px-4 py-3">
      <UIcon name="i-lucide-lock" class="shrink-0 text-xs text-white/20" aria-hidden="true" />
      <p class="text-[0.68rem] text-white/25">
        {{ accommodationForm?.ui['editionNote'] ?? 'Edition locale — sauvegarde non disponible' }}
      </p>
    </div>
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
type Block = { id: string; label: string; icon: string; actions: BlockMenuItem[][] }
type FieldConfig = {
  key: string
  label: string
  readonly?: boolean
  default?: DashboardEditableValue
  half?: boolean
  type?: 'offer' | 'amenity' | 'qualities' | 'category-code' | 'category-code-multi'
  inCodeSet?: string
  separator?: boolean
}
type FrontmatterSection = {
  id: string
  label: string
  hideLabel?: boolean
  separator?: boolean
  fields: FieldConfig[]
}

defineOptions({ name: 'DashboardPropertyEditorPanel' })

const metadataStore = useMetadataStore()
const accommodationForm = computed(() => metadataStore.getAccommodationForm)

const props = defineProps<{
  activeSection: EditorSection
  activeLocale: DashboardLocale
  activeDraft: DashboardDraft | null
  accommodation?: DashboardAccommodation | null
  expandedBlocks: Set<string>
  titleValue: string
  associatedMediaValue: DashboardEditableValue
  mediaImageValue: DashboardEditableValue
  propertyMenuItems: BlockMenuItem[][]
  showClose?: boolean
}>()

const emit = defineEmits<{
  'update:activeSection': [value: EditorSection]
  'update:activeLocale': [value: DashboardLocale]
  close: []
  'toggle-block': [id: string]
  'update-field': [path: string, value: DashboardEditableValue]
  'update-body': [value: string]
  'update-associated-media': [value: DashboardEditableValue]
  'update-media-image': [value: DashboardEditableValue]
}>()

const localeTabs: DashboardLocale[] = ['fr', 'en', 'es']
const sectionTabs: Array<{ value: EditorSection; label: string; icon: string }> = [
  { value: 'content', label: 'Contenu', icon: 'i-lucide-file-text' },
  { value: 'media', label: 'Media', icon: 'i-lucide-images' },
]

const frontmatterSections = computed<FrontmatterSection[]>(() => {
  const form = accommodationForm.value
  const s = (k: string, fb: string) => form?.sections[k] ?? fb
  const f = (k: string, fb: string) => form?.fields[k] ?? fb
  return [
    {
      id: 'classement',
      label: s('classement', 'Classement'),
      hideLabel: true,
      fields: [
        {
          key: 'realEstateListing',
          label: f('realEstateListing', 'Type de listing'),
          type: 'category-code' as const,
          inCodeSet: 'real-estate-listing',
          default: null,
          half: true,
        },
        {
          key: 'category',
          label: f('category', 'Catégorie'),
          type: 'category-code' as const,
          inCodeSet: 'accommodation-type',
          default: null,
          half: true,
        },
        {
          key: 'place',
          label: f('place', 'Lieu'),
          type: 'category-code' as const,
          inCodeSet: 'accommodation-place',
          default: null,
          half: true,
        },
        { key: 'offer', label: f('offer', 'Offre'), type: 'offer', half: true, default: {} },
      ],
    },
    {
      id: 'avis',
      label: s('avis', 'Notre avis'),
      fields: [{ key: 'review', label: f('review', 'Avis agence'), default: null }],
    },
    {
      id: 'details',
      label: s('details', 'Détails'),
      fields: [
        { key: 'highlight', label: f('highlight', 'Accroche'), default: null, half: true },
        { key: 'label', label: f('label', 'Badge'), default: null, half: true },
        { key: 'floorSize', label: f('floorSize', 'Surface habitable'), default: null, half: true },
        { key: 'areaSize', label: f('areaSize', 'Surface totale'), default: null, half: true },
        { key: 'landArea', label: f('landArea', 'Surface terrain'), default: null, half: true },
        { key: 'areaTerrace', label: f('areaTerrace', 'Terrasse'), default: null, half: true },
        {
          key: 'numberOfBedrooms',
          label: f('numberOfBedrooms', 'Chambres'),
          default: null,
          half: true,
        },
        { key: 'numberOfRooms', label: f('numberOfRooms', 'Pièces'), default: null, half: true },
        {
          key: 'numberOfBathroomsTotal',
          label: f('numberOfBathroomsTotal', 'Salles de bain'),
          default: null,
          half: true,
        },
        {
          key: 'numberOfGarages',
          label: f('numberOfGarages', 'Garages'),
          default: null,
          half: true,
        },
        { key: 'occupancy', label: f('occupancy', 'Capacité'), default: null, half: true },
        { key: 'level', label: f('level', 'De plain-pied'), default: false, half: true },
        {
          key: 'yearBuilt',
          label: f('yearBuilt', 'Année de construction'),
          default: null,
          half: true,
        },
      ],
    },
    {
      id: 'confort',
      label: s('confort', 'Éléments de confort'),
      fields: [
        {
          key: 'amenityFeature',
          label: f('amenityFeature', 'Équipements'),
          type: 'category-code-multi' as const,
          inCodeSet: 'amenity-feature',
          default: [],
        },
        {
          key: 'tags',
          label: f('tags', 'Tags'),
          type: 'category-code-multi' as const,
          inCodeSet: 'tag',
          default: [],
        },
      ],
    },
    {
      id: 'qualites',
      label: s('qualites', 'Qualités'),
      fields: [
        { key: 'qualities', label: f('qualities', 'Qualités'), type: 'qualities', default: [] },
      ],
    },
    {
      id: 'seo',
      label: s('seo', 'SEO'),
      fields: [
        { key: 'metaTitle', label: f('metaTitle', 'Méta Title'), default: null },
        { key: 'metaDescription', label: f('metaDescription', 'Méta Description'), default: null },
      ],
    },
    {
      id: 'meta',
      label: s('meta', 'Meta'),
      hideLabel: true,
      separator: true,
      fields: [
        { key: 'slug', label: f('slug', 'Slug'), readonly: true },
        { key: 'dateCreated', label: f('dateCreated', 'Créé le'), readonly: true },
        { key: 'dateModified', label: f('dateModified', 'Modifié le'), readonly: true },
      ],
    },
  ]
})

const contentBlocks = computed<Block[]>(() => {
  const form = accommodationForm.value
  const resetLabel = form?.ui['reset'] ?? 'Réinitialiser'
  return [
    {
      id: 'body',
      label: form?.blocks['body'] ?? 'Description',
      icon: 'i-lucide-file-text',
      actions: [[{ label: resetLabel, icon: 'i-lucide-rotate-ccw', onSelect: () => {} }]],
    },
    {
      id: 'frontmatter',
      label: form?.blocks['frontmatter'] ?? 'Caractéristiques',
      icon: 'i-lucide-file-code',
      actions: [[{ label: resetLabel, icon: 'i-lucide-rotate-ccw', onSelect: () => {} }]],
    },
    {
      id: 'associated-media',
      label: form?.blocks['associatedMedia'] ?? 'Médias associés',
      icon: 'i-lucide-files',
      actions: [],
    },
  ]
})

const isEditingTitle = ref(false)
const titleInputRef = ref<HTMLInputElement | null>(null)

const activateTitle = async (): Promise<void> => {
  isEditingTitle.value = true
  await nextTick()
  titleInputRef.value?.focus()
  titleInputRef.value?.select()
}

const getNestedValue = (record: DashboardEditableRecord, path: string): DashboardEditableValue => {
  const [first, ...rest] = path.split('.')
  if (!first) return null
  const current = record[first] ?? null
  if (rest.length === 0) return current
  if (current === null || typeof current !== 'object' || Array.isArray(current)) return null
  return getNestedValue(current as DashboardEditableRecord, rest.join('.'))
}

const getFieldValue = (
  path: string,
  defaultValue?: DashboardEditableValue,
): DashboardEditableValue => {
  if (!props.activeDraft) return defaultValue ?? null
  const value = getNestedValue(props.activeDraft.frontmatter, path)
  return value ?? defaultValue ?? null
}
</script>
