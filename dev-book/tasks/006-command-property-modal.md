# CommandPropertyModal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un raccourci clavier `ctrl+s` qui ouvre une modale de recherche de biens immobiliers par référence (`identifier`), avec auto-complétion et navigation directe vers la fiche du bien.

**Architecture:** Le composable partagé `useDashboard` expose un état `isCommandPropertyOpen` et le shortcut `ctrl+s`. Un nouveau composant `CommandPropertyModal` — calqué sur `CommandPaletteModal` — monte une `UModal` + `UCommandPalette` branchée sur les données du store d'hébergements. La modale est montée dans le layout `default`.

**Tech Stack:** Nuxt 3, Vue 3 Composition API, Nuxt UI (`UModal`, `UCommandPalette`), Pinia (`useAccommodationStore`), TypeScript strict.

---

## Périmètre — fichiers touchés

| Action   | Fichier |
|----------|---------|
| Modifier | `app/composables/useDashboard.ts` |
| Créer    | `app/components/CommandPropertyModal.vue` |
| Modifier | `app/layouts/default.vue` |

---

### Task 1 : Étendre `useDashboard` — état modal + raccourci `ctrl+s`

**Files:**
- Modify: `app/composables/useDashboard.ts`

#### Contexte

`useDashboard` expose déjà le pattern `isCommandPaletteOpen / openCommandPalette / closeCommandPalette / toggleCommandPalette`. On répète exactement ce pattern pour la nouvelle modale de recherche de biens.

Le shortcut `ctrl_s` s'ajoute dans le bloc `defineShortcuts` (client-only) au même niveau que `meta_k`.

- [ ] **Étape 1 : Mettre à jour `UseDashboardReturn`**

Dans `app/composables/useDashboard.ts`, remplacer le type de retour :

```typescript
type UseDashboardReturn = {
  isCommandPaletteOpen: Ref<boolean>
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  isCommandPropertyOpen: Ref<boolean>
  openCommandProperty: () => void
  closeCommandProperty: () => void
  toggleCommandProperty: () => void
  sidePanels: Ref<SidePanels>
  openSidePanel: (key: keyof SidePanels) => void
  closeSidePanel: (key: keyof SidePanels) => void
  toggleSidePanel: (key: keyof SidePanels) => void
  hideSidePanelsItems: () => void
}
```

- [ ] **Étape 2 : Ajouter l'état et les actions dans `_useDashboard`**

Après la déclaration de `toggleCommandPalette` (ligne 44), insérer :

```typescript
const isCommandPropertyOpen = useState<boolean>('ui.commandProperty.open', () => false)

const openCommandProperty = (): void => {
  isCommandPropertyOpen.value = true
}

const closeCommandProperty = (): void => {
  isCommandPropertyOpen.value = false
}

const toggleCommandProperty = (): void => {
  isCommandPropertyOpen.value = !isCommandPropertyOpen.value
}
```

- [ ] **Étape 3 : Ajouter le shortcut `ctrl_s`**

Dans le bloc `defineShortcuts`, après `ctrl_d`, ajouter :

```typescript
ctrl_s: {
  usingInput: false,
  handler: () => {
    toggleCommandProperty()
  },
},
```

- [ ] **Étape 4 : Exposer les nouvelles valeurs dans le `return`**

Dans l'objet retourné par `_useDashboard`, ajouter après `toggleCommandPalette` :

```typescript
isCommandPropertyOpen,
openCommandProperty,
closeCommandProperty,
toggleCommandProperty,
```

- [ ] **Étape 5 : Vérifier le typage**

```bash
cd /home/johan/www/graines-digitales/modern-web-apps/mlk-my-little-kasbah
npx nuxi typecheck 2>&1 | head -40
```

Attendu : aucune erreur sur `useDashboard.ts`.

- [ ] **Étape 6 : Commit**

```bash
git add app/composables/useDashboard.ts
git commit -m "feat(dashboard): ajouter isCommandPropertyOpen et raccourci ctrl+s"
```

---

### Task 2 : Créer `CommandPropertyModal.vue`

**Files:**
- Create: `app/components/CommandPropertyModal.vue`

#### Contexte

Le composant calque la structure de `CommandPaletteModal.vue` :
- `UModal` pilotée par `isCommandPropertyOpen`
- `UCommandPalette` avec un groupe d'items construits depuis `useAccommodation().items`
- Recherche sur `identifier` et `name` (le `UCommandPalette` filtre nativement sur `label` + `description`)
- Navigation vers `/properties/${listingSlug}/${categorySlug}/${slug}` au clic + fermeture

**Données :** `useAccommodation()` expose `items: ComputedRef<Accommodation[]>`. Chaque `Accommodation` contient :
- `identifier: string` — la référence (ex. `BAVR007`)
- `name: string | null` — le nom du bien
- `slug: string | null` — slug de l'hébergement
- `category?.slug: string` — slug de la catégorie
- `realEstateListing?.slug: string` — slug du type de listing
- `category?.name: string` — libellé de la catégorie

**URL de navigation :** `/properties/${realEstateListing.slug}/${category.slug}/${slug}`

- [ ] **Étape 1 : Créer le fichier**

Créer `app/components/CommandPropertyModal.vue` avec le contenu suivant :

```vue
<template>
  <UModal v-model:open="isCommandPropertyOpen">
    <template #content>
      <UCommandPalette
        :groups="groups"
        :close="true"
        placeholder="Rechercher par référence ou nom…"
        @update:open="closeCommandProperty"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
// 1. Imports
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { Accommodation } from '@schemas/interfaces'

import { computed } from 'vue'

// 4. Composables, stores, routeur
const { items } = useAccommodation()
const localePath = useLocalePath()
const { isCommandPropertyOpen, closeCommandProperty } = useDashboard()

// 7. Validation et helpers purs
const buildPropertyItem = (accommodation: Accommodation): CommandPaletteItem | null => {
  const slug = accommodation.slug?.trim()
  const listingSlug = accommodation.realEstateListing?.slug?.trim()
  const categorySlug = accommodation.category?.slug?.trim()

  if (!slug || !listingSlug || !categorySlug) return null

  const identifier = accommodation.identifier?.trim() ?? ''
  const name = accommodation.name?.trim() ?? slug
  const categoryName = accommodation.category?.name?.trim() ?? categorySlug

  return {
    id: `property-${identifier || slug}`,
    label: identifier ? `[${identifier}] ${name}` : name,
    description: categoryName,
    onSelect: () => {
      closeCommandProperty()
      navigateTo(localePath(`/properties/${listingSlug}/${categorySlug}/${slug}`))
    },
  }
}

// 8. Computed UI-ready
const propertyItems = computed<CommandPaletteItem[]>(() =>
  items.value
    .map(buildPropertyItem)
    .filter((item): item is CommandPaletteItem => item !== null),
)

const groups = computed<CommandPaletteGroup[]>(() => {
  if (!propertyItems.value.length) return []
  return [
    {
      id: 'properties',
      label: 'Biens immobiliers',
      items: propertyItems.value,
    },
  ]
})
</script>
```

- [ ] **Étape 2 : Vérifier le typage**

```bash
npx nuxi typecheck 2>&1 | head -40
```

Attendu : aucune erreur sur `CommandPropertyModal.vue`.

- [ ] **Étape 3 : Commit**

```bash
git add app/components/CommandPropertyModal.vue
git commit -m "feat(dashboard): créer CommandPropertyModal avec recherche par référence"
```

---

### Task 3 : Monter `CommandPropertyModal` dans `app/layouts/default.vue`

**Files:**
- Modify: `app/layouts/default.vue`

#### Contexte

`default.vue` est le layout utilisé pour toutes les pages publiques. Il monte déjà `LazyUdrawerDesignSystem` et `LazyNavigationMain` hors du `<slot />`. On ajoute `CommandPropertyModal` au même niveau.

- [ ] **Étape 1 : Ajouter le composant dans le layout**

Dans `app/layouts/default.vue`, ajouter `<CommandPropertyModal />` après `<LazyUdrawerDesignSystem />` :

```vue
<template>
  <div class="relative h-dvh w-screen overflow-hidden">
    <div class="absolute inset-x-0 top-0 z-50">
      <div
        class="grid min-h-24 grid-cols-2 px-4 pt-6 lg:min-h-32 2xl:min-h-48 2xl:pt-10 2xl:pl-16"
        :class="headerBackgroundClass"
      >
        <div class="justify-self-start">
          <LazyLogoMlkFull size="lg" aria-label="Retour à l'accueil" />
        </div>
        <div class="justify-self-end">
          <LazyNavigationQuickActions />
        </div>
      </div>
    </div>
    <div class="absolute right-4 bottom-4 z-50">
      <LazyNavigationSocialNetwork />
    </div>
    <UMain class="h-full w-full">
      <slot />
    </UMain>
    <LazyUdrawerDesignSystem />
    <CommandPropertyModal />
    <Transition name="fade-up" appear>
      <LazyNavigationMain />
    </Transition>
  </div>
</template>
```

- [ ] **Étape 2 : Vérifier le typage**

```bash
npx nuxi typecheck 2>&1 | head -40
```

Attendu : aucune erreur.

- [ ] **Étape 3 : Test manuel**

1. Lancer le dev server : `npx nuxi dev`
2. Naviguer sur n'importe quelle page publique
3. Appuyer sur `ctrl+s` → la modale s'ouvre
4. Saisir une référence partielle (ex. `BAV`) → les biens correspondants s'affichent en auto-complétion
5. Cliquer sur un bien → navigation vers `/properties/{listing}/{category}/{slug}`
6. Vérifier que `Escape` ou le bouton close ferme la modale

- [ ] **Étape 4 : Commit**

```bash
git add app/layouts/default.vue
git commit -m "feat(layout): monter CommandPropertyModal dans le layout default"
```

---

## Points de vigilance

| Sujet | Note |
|-------|------|
| URL de navigation | `/properties/${listingSlug}/${categorySlug}/${slug}` — à valider sur les données réelles |
| SSR-safety | `isCommandPropertyOpen` est un `useState` (SSR-safe). Le shortcut est dans `import.meta.client` — aucun risque d'hydratation |
| Données vides | Si `items` est vide (store non chargé), `groups` renvoie `[]` et la palette affiche un état vide — comportement attendu |
| `ctrl+s` et inputs | `usingInput: false` — le shortcut ne se déclenche pas quand le focus est dans un champ texte |
| Localisation | `localePath` est utilisé sur l'URL de navigation — le préfixe de locale sera ajouté automatiquement |
