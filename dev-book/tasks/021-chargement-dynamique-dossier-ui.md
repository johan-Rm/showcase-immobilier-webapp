---
status: Todo
---

# 021 Chargement dynamique du dossier `ui/`

## Intention

Remplacer le wiring statique des ressources `ui/` par une découverte automatique des fichiers YAML
présents dans `content/{locale}/ui/` et ses sous-dossiers. Ajouter un fichier YAML dans `ui/` doit
le rendre immédiatement disponible sans toucher à aucun autre fichier de l'application.

## Contexte

Suite à la refonte du dossier `content/fr/` (tâche sans numéro, branche `fix/dashboard-locale-content`),
le contenu est organisé en trois catégories :

- `accommodations/` et `web-pages/` — Markdown, chargement spécialisé, inchangé
- `metadata/` — YAML de données métier (CategoryCode, AccommodationPlace, etc.), wiring explicite maintenu
- `ui/` — YAML de configuration UI (labels, sections, textes), candidat au chargement automatique

Le dossier `ui/` contient actuellement :
- `ui/app.yaml` → composants shell, footer, navigation
- `ui/accommodation.yaml` → labels, sections, textes liés aux fiches
- `ui/dashboard.yaml` → labels de l'éditeur dashboard
- `ui/forms/accommodation.yaml` → labels des champs du formulaire d'édition

Chaque fichier nécessite aujourd'hui sa propre `ResourceKey`, entrée dans `config.ts`, mapping dans
`loaders.ts`, type dédié, slot store, action et composable. Cette friction est injustifiée pour des
fichiers qui ne contiennent que des chaînes de labels.

## Objectif

Le loader scanne automatiquement `content/{locale}/ui/` récursivement. Chaque fichier YAML devient
disponible sous sa clé de chemin relatif sans extension (ex: `accommodation`, `forms/accommodation`).

L'accès côté app se fait via un composable `useUiContent(key)` qui retourne la tranche concernée.

## Périmètre

- modifier `server/utils/content/loaders.ts` pour scanner `ui/` dynamiquement
- créer un composable `useUiContent` pour accéder aux données par clé
- ajouter un slot générique `uiContent: Record<string, unknown>` dans `app/stores/metadata.ts`
- supprimer les `ResourceKey` spécifiques aux fichiers `ui/` devenus inutiles :
  `'app'`, `'ui/accommodation'`, `'forms/accommodation'`, `'dashboard'`
- supprimer les fonctions de chargement individuelles dans `useMetadata` correspondantes
- adapter les consommateurs existants pour utiliser `useUiContent`
- valider que le comportement statique actuel est préservé (même données, même fallbacks)

## Hors périmètre

- dossier `metadata/` : wiring explicite maintenu (logique métier liée)
- dossier `accommodations/` et `web-pages/` : chargement Markdown inchangé
- ajout de nouveaux fichiers UI (sera trivial une fois le mécanisme en place)

## Étapes

### 1. Modifier `server/utils/content/loaders.ts`

Ajouter une fonction `loadUiDirectory` qui :
- résout le chemin `content/{locale}/ui/`
- scanne récursivement tous les fichiers `.yaml`
- charge chacun avec `YAML.parse`
- retourne un `Record<string, unknown>` indexé par chemin relatif sans extension
  (ex: `{ 'app': {...}, 'accommodation': {...}, 'forms/accommodation': {...} }`)

Exposer ce chargement via `loadContentFromFiles` avec la clé `'ui'`.

### 2. Mettre à jour `shared/types/content.ts` et `shared/content/config.ts`

Remplacer les `ResourceKey` individuels `'app'`, `'ui/accommodation'`, `'forms/accommodation'`,
`'dashboard'` par une unique clé `'ui'`.

### 3. Mettre à jour `app/stores/metadata.ts`

Remplacer les slots `app`, `accommodationUi`, `dashboardContent`, `accommodationForm` par un
slot unique `uiContent: Record<string, unknown>` avec getter `getUiContent` et action `setUiContent`.

Maintenir les getters nommés comme wrappers typés si nécessaire pour limiter l'impact sur les consommateurs :
```ts
getAppUi: (state) => state.uiContent['app'] as App | null
getAccommodationUi: (state) => state.uiContent['accommodation'] as AppAccommodation | null
// etc.
```

### 4. Créer le composable `app/composables/useUiContent.ts`

```ts
export const useUiContent = <T = unknown>(key: string): ComputedRef<T | null> => {
  const store = useMetadataStore()
  return computed(() => (store.getUiContent[key] ?? null) as T | null)
}
```

### 5. Mettre à jour `app/composables/useMetadata.ts`

Remplacer les fonctions `loadApp`, `loadAccommodationUi`, `loadDashboardContent`,
`loadAccommodationForm` par une unique `loadUiContent()` qui charge le dossier `ui/` complet.

### 6. Adapter les consommateurs

Les consommateurs existants continuent de fonctionner via les getters nommés du store ou via
`useUiContent('accommodation')`. Aucun changement de comportement attendu.

Fichiers concernés :
- `app/composables/useApp.ts`
- `app/composables/useMetadata.ts`
- `app/components/screen/PropertyDetail.vue`
- `app/components/dashboard/PropertyContentEditor.vue`
- `app/pages/dashboard/index.vue`

### 7. Mettre à jour la documentation

- `docs/2.architecture/2.data-flow.md` — mettre à jour le chemin des données content → store
- `docs/2.architecture/10.services-standard.md` — si `services/content/` est impacté
- `content/README.md` — documenter la structure `ui/`, le mécanisme de découverte automatique
  et la convention de nommage des fichiers (clé = chemin relatif sans extension)

## Validation

- Toutes les pages existantes affichent les mêmes labels qu'avant
- Ajouter `content/fr/ui/test.yaml` avec `{ hello: 'monde' }` et vérifier que
  `useUiContent('test').value?.hello === 'monde'` sans aucun autre changement
- `make type-check` sans erreur
- `make lint:check` sans erreur
