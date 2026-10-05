---
status: Terminé
source: brief dashboard metadata select
---

# 014 Dashboard — Sélecteurs de métadonnées avec autocomplétion et création à la volée

## Intention

Les champs de métadonnées d'un bien (catégorie, listing, lieu, équipements, tags) sont
actuellement des champs texte libres ou des composants spécifiques non connectés à Symfony.

Cette task les remplace par des combobox avec autocomplétion alimentées par les
`CategoryCode` Symfony. Si un code n'existe pas, l'utilisateur peut le créer directement
depuis le select sans quitter l'éditeur.

## Périmètre

### Côté Nuxt (showcase-immobilier-webapp)

#### Routes Nitro serveur

- `GET /api/dashboard/category-codes` — retourne les CategoryCodes groupés par `inCodeSet`
  depuis le cache Symfony existant (`getCategoryCodeMap`)
- `POST /api/dashboard/category-codes` — crée un nouveau CategoryCode dans Symfony
  et invalide le cache local

#### Composable

- créer `app/composables/dashboard/useCategoryCodeOptions.ts`
  - appelle `GET /api/dashboard/category-codes` au montage
  - expose une fonction `optionsFor(inCodeSet: string): { label: string; value: string }[]`
    construite depuis les codes (valeur = code, label = code humanisé ou code brut)
  - expose `createCode(inCodeSet, code)` qui appelle `POST /api/dashboard/category-codes`
    et rafraîchit les options

#### Composant

- créer `app/components/dashboard/CategoryCodeSelect.vue`
  - wrapper autour de `UInputMenu` (Nuxt UI v4)
  - props : `inCodeSet`, `modelValue` (string | string[]), `label`, `placeholder`, `multiple`
  - alimente `UInputMenu` avec les options du composable (`optionsFor(inCodeSet)`)
  - utilise la prop `create-item` de `UInputMenu` pour déclencher `createCode` à la volée
  - affiche un état loading pendant la création
  - gère l'erreur inline sans bloquer l'éditeur
  - un seul composant couvre les cas single et multi via la prop `multiple`

#### Intégration dans l'éditeur

- dans `PropertyEditorPanel.vue`, ajouter un type de field `category-code` (single) et
  `category-code-multi` (multi) dans la map de rendu des sections
- câbler les champs suivants :

| Champ               | inCodeSet             | Type   |
| ------------------- | --------------------- | ------ |
| `category`          | `accommodation-type`  | single |
| `realEstateListing` | `real-estate-listing` | single |
| `place`             | `accommodation-place` | single |
| `amenityFeature`    | `amenity-feature`     | multi  |
| `tags`              | `tag`                 | multi  |

#### Gestion d'erreur

- si `POST /api/dashboard/category-codes` échoue, afficher un message inline dans le
  combobox sans bloquer l'éditeur
- si `GET /api/dashboard/category-codes` échoue, afficher les champs en fallback texte libre

### Côté Symfony — prérequis backend

- exposer `POST /api/projects/{projectId}/category-codes/translations` acceptant :
  ```json
  {
    "inCodeSet": "accommodation-type",
    "translations": [{ "locale": "fr", "label": "Maison d'hotes" }]
  }
  ```
  Réponse :
  `{ "@id": "/api/category-codes/uuid", "codeValue": "maison-dhotes", "inCodeSet": "...", "translations": [...] }`
- s'assurer que `GET /api/projects/{projectId}/category-codes` retourne bien tous les
  `inCodeSet` utilisés (voir brief `docs/superpowers/brief-backend-api-sauvegarde-dashboard.md`)

### Etat actuel du contrat

- `GET /api/dashboard/category-codes` normalise les reponses Symfony `member` et
  `hydra:member`.
- Le BFF accepte les reponses Symfony qui exposent `codeValue` ou `code`, puis renvoie au
  front un tableau plat avec `iri`, `code` et `inCodeSet`.
- `POST /api/dashboard/category-codes` relaie vers
  `POST /api/projects/{projectId}/category-codes/translations`.
- Le payload Symfony contient `inCodeSet` et `translations[]`. `codeValue` est derive par le
  backend depuis le label.
- Apres creation, `CategoryCodeSelect.vue` ajoute immediatement l IRI creee dans
  `metadata.irisMap` pour permettre une sauvegarde du bien sans refresh manuel.

## Hors périmètre

- modification ou suppression d'un CategoryCode existant
- gestion des libellés traduits pour les codes (label = code brut en V1)
- réorganisation des codes par ordre d'usage

## Critères d'acceptance

- les champs `category`, `realEstateListing`, `place` proposent l'autocomplétion sur les
  codes Symfony existants
- les champs `amenityFeature` et `tags` permettent la sélection multiple avec autocomplétion
- la saisie d'un code inexistant propose « Créer "xxx" » et l'option apparaît immédiatement
  dans la liste après création
- la sauvegarde via la task 008 fonctionne sans régression après ce changement
- les combobox sont navigables au clavier et ont des labels accessibles

## Dépendances

- task 008 : route Nitro PUT + cache CategoryCode (terminée)
- backend : `POST /api/projects/{projectId}/category-codes/translations`
