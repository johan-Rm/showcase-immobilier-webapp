# Task 009 — Re-export Markdown après sauvegarde Symfony

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Après un Save réussi dans Symfony, régénérer automatiquement le fichier `.md` du bien dans `content/fr/accommodations/` pour que le site public reste synchronisé sans changer son circuit de lecture.

**Architecture:** La route Nitro PUT (task 008) orchestre déjà le flux save→Symfony. On y greffe un appel post-succès à un utilitaire `markdownExporter.ts` qui sérialise `accommodation.frontmatter` + `body` en fichier Markdown. En cas d'échec du write, la BDD reste cohérente et l'UI affiche un avertissement discret. Côté client, `useDashboardSave` invalide le cache serveur (30s) et émet un événement `saved` qui remonte jusqu'à la page dashboard pour rafraîchir la liste.

**Tech Stack:** `yaml` (déjà présent), `node:fs/promises`, Nitro server utils, Vue 3 composables

---

## Carte des fichiers

| Fichier | Action | Responsabilité |
|---|---|---|
| `server/utils/dashboard/markdownExporter.ts` | Créer | Sérialisation frontmatter YAML + write fichier |
| `server/api/dashboard/accommodations/[identifier].put.ts` | Modifier | Appel exportToMarkdown post-succès, retour markdownUpdated |
| `app/composables/dashboard/useDashboardSave.ts` | Modifier | Expose markdownUpdated, invalide cache serveur |
| `app/components/dashboard/PropertyEditorSlideover.vue` | Modifier | Avertissement si markdownUpdated: false, émet `saved` |
| `app/components/dashboard/PropertyWorkspace.vue` | Modifier | Propage événement `saved` → `refresh` |

---

## Task 1 — `markdownExporter.ts` : utilitaire de sérialisation

**Fichiers :**
- Créer : `server/utils/dashboard/markdownExporter.ts`

### Contexte

`DashboardAccommodation.frontmatter` est un `DashboardEditableRecord` construit depuis le frontmatter YAML brut d'origine (voir `server/utils/dashboard/accommodations.ts`, ligne 198 : `toEditableRecord(rawRecord)`). Il contient **tous** les champs d'origine, y compris `image[]`, `associatedMedia` et `additionalProperty`. Le body est séparé. Le fileName est `{slug}.md`.

La protection fixture : si `additionalProperty` contient `{ name: 'dataSource', value: 'fixture' }`, on skip le write.

Le package `yaml` (importé dans le projet comme `import YAML from 'yaml'`) sérialise correctement les strings multi-lignes (style `|`), les nulls, les booleans et les objets imbriqués.

- [ ] **Créer le fichier `server/utils/dashboard/markdownExporter.ts`**

```ts
import type { DashboardAccommodation, DashboardEditableValue } from '#shared/types/dashboardAccommodation'

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import YAML from 'yaml'

function isFixture(accommodation: DashboardAccommodation): boolean {
  const additionalProperty = accommodation.frontmatter.additionalProperty
  if (!Array.isArray(additionalProperty)) return false
  return additionalProperty.some((prop) => {
    if (typeof prop !== 'object' || prop === null || Array.isArray(prop)) return false
    const entry = prop as Record<string, DashboardEditableValue>
    return entry.name === 'dataSource' && entry.value === 'fixture'
  })
}

function buildMarkdown(frontmatter: Record<string, DashboardEditableValue>, body: string): string {
  const yaml = YAML.stringify(frontmatter)
  const trimmedBody = body.trimStart()
  return `---\n${yaml}---\n\n${trimmedBody}\n`
}

export type MarkdownExportResult =
  | { updated: true; filePath: string }
  | { updated: false; reason: string }

export async function exportToMarkdown(
  accommodation: DashboardAccommodation,
): Promise<MarkdownExportResult> {
  if (isFixture(accommodation)) {
    return { updated: false, reason: 'fixture_skipped' }
  }

  const filePath = join(
    process.cwd(),
    'content',
    accommodation.locale,
    'accommodations',
    accommodation.fileName,
  )

  const content = buildMarkdown(accommodation.frontmatter, accommodation.body)

  await writeFile(filePath, content, 'utf8')

  return { updated: true, filePath }
}
```

- [ ] **Vérifier manuellement la structure produite** en lisant un `.md` de référence et en comparant la forme attendue :

```
---
identifier: BAVLC001
name: Mon bien
offer:
  price: 240000
  priceCurrency: EUR
...
---

## Corps Markdown
```

---

## Task 2 — Intégration dans la route Nitro PUT

**Fichiers :**
- Modifier : `server/api/dashboard/accommodations/[identifier].put.ts`

### Contexte

La route actuelle retourne `{ success: true; uuid: string }`. On y ajoute `markdownUpdated: boolean`.

Le write fichier est non-bloquant : si `exportToMarkdown` lève une exception, on log et on retourne `markdownUpdated: false`. La BDD reste cohérente (source de vérité).

- [ ] **Mettre à jour le type de retour et l'import**

En haut du fichier, ajouter l'import :
```ts
import { exportToMarkdown } from '../../../utils/dashboard/markdownExporter'
```

- [ ] **Modifier la signature de retour**

```ts
export default defineEventHandler(async (event): Promise<{ success: true; uuid: string; markdownUpdated: boolean }> => {
```

- [ ] **Ajouter l'appel post-succès après le bloc if/else Symfony**

Remplacer le `return { success: true, uuid }` final par :

```ts
  let markdownUpdated = false
  try {
    const result = await exportToMarkdown(accommodation)
    markdownUpdated = result.updated
  } catch (err) {
    console.error('[markdown-export] Échec write fichier :', err)
  }

  return { success: true, uuid, markdownUpdated }
```

- [ ] **Vérifier que le fichier complet est cohérent** (pas de variable `uuid` dupliquée, pas de `return` orphelin)

Le fichier complet attendu après modification :

```ts
import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

import { exportToMarkdown } from '../../../utils/dashboard/markdownExporter'
import { mapToApiPlatform } from '../../../utils/dashboard/accommodationMapper'
import { getSymfonyServiceToken } from '../../../utils/dashboard/symfonyAuth'
import {
  getCategoryCodeMap,
  getAccommodationUuidMap,
  invalidateSymfonyCache,
} from '../../../utils/dashboard/symfonyCache'

const DEFAULT_LOCALE = 'fr'

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

export default defineEventHandler(async (event): Promise<{ success: true; uuid: string; markdownUpdated: boolean }> => {
  await requireUserSession(event)

  const identifier = getRouterParam(event, 'identifier')
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing accommodation identifier' })
  }

  const query = getQuery(event)
  const locale =
    typeof query.locale === 'string' && query.locale.length > 0 ? query.locale : DEFAULT_LOCALE

  const accommodation = await readBody<DashboardAccommodation>(event)
  if (!accommodation?.frontmatter) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid accommodation payload' })
  }

  const { apiUrl, projectId } = getApiBase()
  const [token, codeMap, uuidMap] = await Promise.all([
    getSymfonyServiceToken(),
    getCategoryCodeMap(),
    getAccommodationUuidMap(),
  ])

  const payload = await mapToApiPlatform(accommodation, locale, codeMap)

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/ld+json',
    Accept: 'application/ld+json',
  }

  const existingUuid = uuidMap[identifier] ?? null

  let uuid: string

  if (existingUuid) {
    await $fetch(
      `${apiUrl}/api/projects/${projectId}/accommodations/${existingUuid}?locale=${locale}`,
      { method: 'PUT', headers, body: payload },
    )
    uuid = existingUuid
  } else {
    const created = await $fetch<{ '@id': string }>(
      `${apiUrl}/api/projects/${projectId}/accommodations?locale=${locale}`,
      { method: 'POST', headers, body: payload },
    )
    const newUuid = created['@id'].split('/').at(-1)
    if (!newUuid) {
      throw createError({ statusCode: 502, statusMessage: 'Symfony response missing @id' })
    }
    uuid = newUuid
    invalidateSymfonyCache()
  }

  let markdownUpdated = false
  try {
    const result = await exportToMarkdown(accommodation)
    markdownUpdated = result.updated
  } catch (err) {
    console.error('[markdown-export] Échec write fichier :', err)
  }

  return { success: true, uuid, markdownUpdated }
})
```

---

## Task 3 — Mise à jour du composable `useDashboardSave`

**Fichiers :**
- Modifier : `app/composables/dashboard/useDashboardSave.ts`

### Contexte

Actuellement `save()` appelle PUT et retourne `boolean`. Après task 009 :
- `save()` expose `markdownUpdated` (ref `null | boolean`)
- Après succès, on invalide le cache serveur en appelant `$fetch('/api/dashboard/accommodations', { query: { locale, refresh: '1' } })` en fire-and-forget (non bloquant)

`markdownUpdated` vaut :
- `null` : aucune save effectuée ou save en cours
- `true` : fichier mis à jour
- `false` : BDD ok mais fichier non mis à jour (erreur write)

- [ ] **Remplacer le contenu de `app/composables/dashboard/useDashboardSave.ts`** :

```ts
import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

import { toValue } from 'vue'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export const useDashboardSave = () => {
  const { localeSetting } = useLang()

  const status = ref<SaveStatus>('idle')
  const errorMessage = ref<string | null>(null)
  const markdownUpdated = ref<boolean | null>(null)

  const save = async (accommodation: DashboardAccommodation): Promise<boolean> => {
    status.value = 'saving'
    errorMessage.value = null
    markdownUpdated.value = null

    try {
      const locale = toValue(localeSetting)
      const result = await $fetch<{ success: true; uuid: string; markdownUpdated: boolean }>(
        `/api/dashboard/accommodations/${accommodation.identifier}`,
        { method: 'PUT', query: { locale }, body: accommodation },
      )

      markdownUpdated.value = result.markdownUpdated

      // Invalide le cache serveur (TTL 30s) sans bloquer l'UI
      $fetch('/api/dashboard/accommodations', {
        query: { locale, refresh: '1' },
      }).catch(() => {/* silencieux */})

      status.value = 'success'

      setTimeout(() => {
        if (status.value === 'success') status.value = 'idle'
      }, 3000)

      return true
    } catch (err: unknown) {
      status.value = 'error'
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      errorMessage.value = message
      return false
    }
  }

  const reset = () => {
    status.value = 'idle'
    errorMessage.value = null
    markdownUpdated.value = null
  }

  return { status, errorMessage, markdownUpdated, save, reset }
}
```

---

## Task 4 — Avertissement dans `PropertyEditorSlideover`

**Fichiers :**
- Modifier : `app/components/dashboard/PropertyEditorSlideover.vue`

### Contexte

Deux changements dans ce composant :
1. Récupérer `markdownUpdated` depuis `useDashboardSave`
2. Afficher un avertissement discret si `saveStatus === 'success' && markdownUpdated === false`
3. Émettre `saved` après un save réussi (pour permettre au parent de rafraîchir la liste)

- [ ] **Mettre à jour le `defineEmits`** dans `<script setup>` :

Remplacer :
```ts
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
```
Par :
```ts
const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()
```

- [ ] **Mettre à jour la déstructuration de `useDashboardSave`** :

Remplacer :
```ts
const {
  status: saveStatus,
  errorMessage: saveErrorMessage,
  save,
  reset: resetSave,
} = useDashboardSave()
```
Par :
```ts
const {
  status: saveStatus,
  errorMessage: saveErrorMessage,
  markdownUpdated: saveMarkdownUpdated,
  save,
  reset: resetSave,
} = useDashboardSave()
```

- [ ] **Mettre à jour `handleSave`** pour émettre `saved` :

Remplacer :
```ts
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
```
Par :
```ts
const handleSave = async (): Promise<void> => {
  if (!props.accommodation || !activeDraft.value) return

  const payload: DashboardAccommodation = {
    ...props.accommodation,
    locale: activeLocale.value,
    frontmatter: activeDraft.value.frontmatter,
    body: activeDraft.value.body,
  }

  const ok = await save(payload)
  if (ok) emit('saved')
}
```

- [ ] **Ajouter l'avertissement dans le template** après le message d'erreur existant (ligne ~80) :

Remplacer :
```html
<!-- Message d'erreur sauvegarde -->
<p v-if="saveStatus === 'error'" class="mb-2 text-xs text-red-400">
  {{ saveErrorMessage ?? 'Erreur lors de la sauvegarde' }}
</p>
```
Par :
```html
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
```

---

## Task 5 — Propagation de l'événement `saved` dans `PropertyWorkspace`

**Fichiers :**
- Modifier : `app/components/dashboard/PropertyWorkspace.vue`

### Contexte

`PropertyWorkspace` est le parent de `PropertyEditorSlideover`. Il reçoit déjà un `@refresh` du sidebar et l'émet au parent (page dashboard). Il faut propager `saved` de la même façon.

- [ ] **Ajouter `saved` dans les emits** (après `refresh: []`) :

```ts
const emit = defineEmits<{
  refresh: []
  logout: []
}>()
```
Devient :
```ts
const emit = defineEmits<{
  refresh: []
  saved: []
  logout: []
}>()
```

- [ ] **Écouter `@saved` sur le slideover et propager** :

Remplacer dans le template :
```html
<DashboardPropertyEditorSlideover
  v-model:open="isEditorOpen"
  :accommodation="activeAccommodation"
/>
```
Par :
```html
<DashboardPropertyEditorSlideover
  v-model:open="isEditorOpen"
  :accommodation="activeAccommodation"
  @saved="emit('refresh')"
/>
```

---

## Task 6 — Valider

- [ ] **Lancer le lint sur les fichiers touchés** :

```bash
bun run lint:check 2>&1 | grep -E "markdownExporter|identifier\].put|useDashboardSave|PropertyEditorSlideover|PropertyWorkspace"
```

Résultat attendu : aucune ligne d'erreur pour ces fichiers.

- [ ] **Lancer lint global** pour vérifier que rien d'autre n'est cassé :

```bash
bun run lint:check 2>&1 | tail -5
```

Résultat attendu : seules les erreurs pré-existantes (PropertyFieldEditor, SidebarUserCard, accommodationSlug.vue).

- [ ] **Commit de clôture** :

```bash
git add \
  server/utils/dashboard/markdownExporter.ts \
  server/api/dashboard/accommodations/[identifier].put.ts \
  app/composables/dashboard/useDashboardSave.ts \
  app/components/dashboard/PropertyEditorSlideover.vue \
  app/components/dashboard/PropertyWorkspace.vue

git commit -m "feat(dashboard): task 009 — re-export Markdown après sauvegarde Symfony"
```

- [ ] **Mettre le statut de la task à jour** :

Dans `dev-book/tasks/009-dashboard-reexport-markdown-apres-sauvegarde.md`, changer `status: A faire` en `status: Terminé`.

---

## Self-review

**Spec coverage :**

| Exigence spec | Couverte par |
|---|---|
| Régénérer `.md` après Save réussi | Task 2 (appel exportToMarkdown) |
| Frontmatter depuis données confirmées | Task 1 (serialize accommodation.frontmatter) |
| Conserver body existant | Task 1 (accommodation.body) |
| Pas toucher les fixtures | Task 1 (isFixture check) |
| Atomicité partielle (BDD prime) | Task 2 (try/catch non-bloquant) |
| V1 FR uniquement | Task 1 (accommodation.locale = 'fr') |
| Préserver image[], additionalProperty | ✅ Déjà dans frontmatter (chargé depuis le fichier) |
| Si write échoue → markdownUpdated: false | Task 2 + Task 3 |
| UI avertissement si markdownUpdated: false | Task 4 |
| Cache serveur invalidé après save | Task 3 ($fetch refresh=1) |
| Dashboard liste rafraîchie | Task 4 (emit saved) + Task 5 (propagation) |
| Nouveau bien : créer le fichier | Task 1 (writeFile crée le fichier s'il n'existe pas) |

**Placeholder scan :** Aucun TBD/TODO/placeholder détecté.

**Type consistency :** `markdownUpdated: boolean` cohérent entre route (return type), composable (`ref<boolean | null>`), et template (`=== false`).
