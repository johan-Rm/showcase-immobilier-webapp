<template>
  <div v-for="block in contentBlocks" :key="block.id" class="border-b border-white/6">
    <div class="flex items-stretch transition-colors hover:bg-white/5">
      <button
        type="button"
        class="flex flex-1 items-center gap-3 px-4 py-3 text-left"
        @click="emit('toggle-block', block.id)"
      >
        <UIcon :name="block.icon" class="shrink-0 text-base text-white/35" aria-hidden="true" />
        <span class="flex-1 text-sm font-medium text-white/65">{{ block.label }}</span>
        <UIcon
          :name="expandedBlocks.has(block.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
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
                v-else-if="field.type === 'category-code' || field.type === 'category-code-multi'"
                :in-code-set="field.inCodeSet ?? ''"
                :model-value="getFieldValue(field.key, field.default)"
                :label="field.label"
                :placeholder="field.label"
                :multiple="field.type === 'category-code-multi'"
                :show-label="field.showLabel !== false"
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
        <DashboardPropertyAssociatedMediaEditor
          :media-image-value="mediaImageValue"
          :associated-media="associatedMediaValue"
          @update:media-image-value="emit('update-media-image', $event)"
          @update:associated-media="emit('update-associated-media', $event)"
        />
      </template>
    </div>

    <div class="mx-4 h-px bg-white/5" />
  </div>
</template>

<script setup lang="ts">
import type {
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

defineOptions({ name: 'DashboardPropertyContentEditor' })

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
  showLabel?: boolean
}
type FrontmatterSection = {
  id: string
  label: string
  hideLabel?: boolean
  separator?: boolean
  fields: FieldConfig[]
}

const props = defineProps<{
  activeDraft: DashboardDraft
  expandedBlocks: Set<string>
  associatedMediaValue: DashboardEditableValue
  mediaImageValue: DashboardEditableValue
}>()

const emit = defineEmits<{
  'toggle-block': [id: string]
  'update-field': [path: string, value: DashboardEditableValue]
  'update-body': [value: string]
  'update-associated-media': [value: DashboardEditableValue]
  'update-media-image': [value: DashboardEditableValue]
}>()

const metadataStore = useMetadataStore()
const accommodationForm = computed(() => metadataStore.getAccommodationForm)

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
        { key: 'level', label: f('level', 'Étage'), default: 0, half: true },
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
          showLabel: false,
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
      separator: false,
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
  const value = getNestedValue(props.activeDraft.frontmatter, path)
  return value ?? defaultValue ?? null
}
</script>
