---
status: À faire
dependances: []
---

# 032 — Dashboard : édition des screens du parcours (hasPart)

> **Pour les agents:** Utiliser `superpowers:subagent-driven-development` ou
> `superpowers:executing-plans` pour exécuter ce plan tâche par tâche.
>
> **Lien :** produit la donnée `hasPart` que la tâche **031** consomme côté public
> (parcours immersif). Le contrat `hasPart` (types `SCREEN_ACCOMMODATION_*`, champs
> name/headline/text/associatedMedia/meta) est déjà fixé par le schéma et la fixture
> `villa-des-alizes.md`.

**Goal:** Permettre, dans l'éditeur de bien du dashboard, d'ajouter **autant de screens que
nécessaire** sous « Médias associés ». Chaque screen = un bloc `hasPart` : choix du **template
de screen**, édition de la **zone de texte** (désignation, titre, paragraphe) et **ajout
d'images**. À l'enregistrement, les screens persistent **à la fois dans l'API Symfony et dans
le markdown**.

**Architecture:** L'éditeur de contenu `PropertyContentEditor.vue` est un accordéon de blocks
(`frontmatter` / `body` / `place` / `associated-media`). On ajoute **un seul** block conteneur
**`screens`** après `associated-media` ; à son ouverture il déploie la liste des screens sous
forme de cartes repliables (template + textes + images), avec ajout/réordre/suppression — même
logique que « Médias associés » qui contient déjà une liste. La donnée vit dans
`activeDraft.frontmatter.hasPart`.

Le pipeline de sauvegarde existant est étendu :

- **PUT Symfony** : `server/utils/dashboard/accommodationMapper.ts` (`mapToApiPlatform`) mappe
  aujourd'hui `associatedMedia` mais **pas** `hasPart` → ajouter `mapHasPart`. Le DTO Symfony
  (`schemas/dtos/accommodation.ts:59`) accepte déjà `hasPart`.
- **Markdown** : `server/utils/dashboard/markdownExporter.ts` sérialise tout le frontmatter en
  YAML → `hasPart` s'exporte automatiquement une fois présent dans le draft.
- **Résolution médias** : `services/mapper/accommodation.ts` résout déjà
  `associatedMedia` (identifiant → url) mais **pas** les médias internes à `hasPart` → étendre,
  pour que le mapper de 031 lise bien des `url`.

**Décisions de cadrage :**

- **Structure UI** : un bloc conteneur unique « Screens » + cartes repliables (accordéon de 1er
  niveau stable).
- **Langues** : structure **partagée** (template, ordre, meta, médias) + **textes localisés**
  (name/headline/text édités par onglet FR/EN).
- **Écran Contact** : **auto-ajouté** au rendu (031), **non éditable** ici → l'éditeur ne propose
  que les **6 templates d'espaces** `SCREEN_ACCOMMODATION_{FULL,SPLIT,TRYPTIQUE,CAROUSEL,OVERLAY,DUO}`.
- **Persistance** : **API Symfony + markdown** (pipeline complet).
- **Médias de screen** : stockés par **identifiant** (réutilisation du media picker + résolution
  centrale), comme `associatedMedia` — pas d'url en dur.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript strict, Nuxt UI v4, Nitro, Pinia, `yaml`.

---

## Fichiers impactés

| Fichier                                                          | Action   |
| --------------------------------------------------------------- | -------- |
| `app/components/dashboard/PropertyScreensEditor.vue`            | Créer    |
| `app/components/dashboard/PropertyScreenEditor.vue`             | Créer    |
| `app/components/dashboard/ScreenTemplateSelect.vue`             | Créer    |
| `app/components/dashboard/PropertyContentEditor.vue`            | Modifier |
| `app/components/dashboard/PropertyEditorPanel.vue`              | Modifier |
| `shared/types/dashboardAccommodation.ts`                        | Modifier |
| `server/utils/dashboard/accommodationMapper.ts`                 | Modifier |
| `server/utils/dashboard/markdownExporter.ts`                    | Modifier |
| `server/utils/dashboard/translationNormalizer.ts`              | Modifier |
| `services/mapper/accommodation.ts`                              | Modifier |
| `server/utils/dashboard/accommodationMapper.vitest.ts`         | Modifier |

---

## Tâche 1 — Contrat & types éditables

**Fichier :** `shared/types/dashboardAccommodation.ts` (modifier)

- [ ] Définir le type éditable d'un screen (forme draft) :
  `{ additionalType: string; position: number; name?: string; headline?: string; text?: string;
  associatedMedia?: Array<{ image: string; caption?: string }>; meta?: { reverse?: boolean; overlayMode?: 'dark' | 'light' } }`.
- [ ] Exposer la liste des templates d'espaces sélectionnables (les **6**, hors `CONTACT`) avec
  libellé + icône, source unique réutilisée par le select et la validation.
- [ ] `additionalType` est une **string** (cf. fixture `villa-des-alizes.md`), pas un objet.

## Tâche 2 — Block `screens` dans l'éditeur de contenu

**Fichier :** `app/components/dashboard/PropertyContentEditor.vue` (modifier)

- [ ] Ajouter un block `screens` à `contentBlocks` **après** `associated-media`
  (icône `i-lucide-layout-list`, libellé i18n « Screens » via `panel.blocks.screens`).
- [ ] Dans le `v-if` de rendu des blocks, brancher
  `<DashboardPropertyScreensEditor :screens="hasPartValue" :locale="activeLocale"
  @update:screens="emit('update-field','hasPart', $event)" />`.
- [ ] Ajouter `hasPartValue` (lecture de `activeDraft.frontmatter.hasPart`) et le passage de la
  locale active (pour savoir quel texte localisé éditer). Réutiliser `getFieldValue('hasPart', [])`.

## Tâche 3 — Éditeur de liste de screens

**Fichier :** `app/components/dashboard/PropertyScreensEditor.vue` (créer)

- [ ] Affiche la liste ordonnée des screens (tri par `position`) sous forme de **cartes
  repliables** : en-tête récapitulatif `« ⋮ {position} · {libellé template} »` + chevron
  d'ouverture, le corps (carte d'édition Tâche 4) ne se déploie que sur la carte ouverte. Le
  bloc d'accordéon de 1er niveau « Screens » reste, lui, unique et stable.
- [ ] État vide explicite (aucun screen).
- [ ] Bouton « Ajouter un screen » → ajoute un screen avec `position` = max+1,
  `additionalType` par défaut (`SCREEN_ACCOMMODATION_FULL`), textes/médias vides, et l'ouvre.
- [ ] Par screen : monter/descendre (recalcule `position`, patron `PropertyAssociatedMediaEditor`),
  supprimer, et la carte d'édition repliable (Tâche 4).
- [ ] Émet `update:screens` avec le tableau complet à chaque mutation. **Mutations de structure**
  (ajout/suppression/ordre/template/meta/médias) → s'appliquent à la donnée partagée ; **mutations
  de texte** → seulement sur la locale active (cf. Tâche 8).

## Tâche 4 — Carte d'édition d'un screen

**Fichier :** `app/components/dashboard/PropertyScreenEditor.vue` (créer)

- [ ] **Template** : `<DashboardScreenTemplateSelect>` (Tâche 5) → écrit `additionalType` (string).
- [ ] **Zone de texte** (localisée) : champs `name` (désignation), `headline` (titre — gérer le
  marqueur d'accent `**…**` comme dans le POC), `text` (paragraphe). Réutiliser le style des
  inputs dashboard.
- [ ] **Options conditionnelles** (`meta`, partagé) selon le template :
  - `reverse` (toggle) pour `SPLIT` / `OVERLAY` / `TRYPTIQUE` ;
  - `overlayMode` (`dark` / `light`) pour `OVERLAY`.
- [ ] **Médias** : réutiliser `<DashboardPropertyAssociatedMediaEditor :associated-media="…"
  :full-width-items="true" @update:associated-media="…" />` sur le tableau de médias du screen
  (stockage par identifiant + media picker existant).
- [ ] Émet les mutations vers le parent (pas d'accès store direct au draft).

## Tâche 5 — Select de template de screen

**Fichier :** `app/components/dashboard/ScreenTemplateSelect.vue` (créer)

- [ ] `USelect`/`USelectMenu` listant les **6** templates (libellé lisible + icône, source Tâche 1),
  `model-value` = `additionalType` string, `@update:model-value`.
- [ ] Pas d'option `CONTACT` (auto-ajouté au rendu, cf. décisions).

## Tâche 6 — Persistance API Symfony (PUT)

**Fichier :** `server/utils/dashboard/accommodationMapper.ts` (modifier)

- [ ] Ajouter `mapHasPart(fm.hasPart, mediaObjectIriBase)` sur le modèle de `mapAssociatedMedia` :
  - conserve `additionalType` (string), `position`, `name`, `headline`, `text`, `meta` ;
  - mappe `associatedMedia[].image` (identifiant) → IRI média Symfony, comme l'associatedMedia racine.
- [ ] Inclure `hasPart` dans l'objet retourné par `mapToApiPlatform`.
- [ ] Gérer l'absence de screens (omettre la clé ou `[]` selon le contrat API).

## Tâche 7 — Export markdown

**Fichier :** `server/utils/dashboard/markdownExporter.ts` (modifier)

- [ ] Vérifier que `hasPart` présent dans le frontmatter est bien sérialisé par
  `YAML.stringify` (forme attendue : identique à `villa-des-alizes.md`).
- [ ] Gérer le statut localisé/global de `hasPart` en cohérence avec la Tâche 8 (ne pas le laisser
  écraser les textes des autres locales lors de `mergeGlobalFields` / `propagateGlobalFields`).

## Tâche 8 — Traductions : structure partagée / textes localisés (POINT DUR)

**Fichiers :** `server/utils/dashboard/translationNormalizer.ts` (+ `markdownExporter.ts`)

Le mécanisme actuel est **binaire** (`LOCALIZED_FIELDS` = champ entièrement global **ou**
entièrement localisé). `hasPart` est **hybride** : structure partagée, textes par langue.

- [ ] Introduire une fonction `mergeHasPartLocales(activeHasPart, otherLocaleHasPart)` :
  - apparie les screens par `position` (ou un id stable de screen) ;
  - prend la **structure** depuis la locale active (`additionalType`, `position`, `meta`,
    `associatedMedia`) ;
  - prend les **textes** (`name`, `headline`, `text`) depuis la locale cible si présents, sinon vides ;
  - crée les screens nouvellement ajoutés (textes vides côté autre locale), supprime/réordonne
    comme la locale active.
- [ ] Câbler cette fusion dans le flux `saveMultilingual` / la normalisation des traductions, pour
  que chaque locale enregistrée ait la **même structure** et **ses propres** textes.
- [ ] Ne **pas** se contenter d'ajouter `hasPart` à `LOCALIZED_FIELDS` (gèlerait les textes des
  autres langues) ni de le laisser global (textes figés sur une langue).

## Tâche 9 — Résolution des médias de screen côté lecture

**Fichier :** `services/mapper/accommodation.ts` (modifier)

- [ ] Étendre le mapping pour résoudre `hasPart[].associatedMedia[]` (identifiant → `{ url, caption }`)
  via le même index image que `mapAssociatedMedia`, afin que le mapper de **031**
  (`services/mapper/exceptional.ts`, qui lit `part.associatedMedia[].url`) reçoive des url résolues.
- [ ] Rester dans le rôle d'ingestion (résolution d'identifiants) ; aucune logique de présentation.

## Tâche 10 — i18n & validation

- [ ] Externaliser les libellés dashboard ajoutés (block « Screens », « Ajouter un screen »,
  libellés de templates, « Inverser », « Mode overlay »…) via les clés de traduction du dashboard
  (`dashboardContent.editor.panel…`).
- [ ] Validation souple : un screen a besoin d'un `additionalType` et d'au moins un média ;
  signaler (sans bloquer la sauvegarde) un screen incomplet. La garde `isExceptionalProperty`
  (031) filtre déjà les screens invalides côté public.

## Tâche 11 — Tests

**Fichier :** `server/utils/dashboard/accommodationMapper.vitest.ts` (modifier) + unitaires fusion

- [ ] `mapHasPart` : structure conservée, `associatedMedia.image` → IRI, absence de screens.
- [ ] `mergeHasPartLocales` : structure de la locale active appliquée à l'autre locale, textes
  cibles préservés, ajout/suppression/réordonnancement, screen nouveau = textes vides.
- [ ] Export markdown : `hasPart` sérialisé à la forme attendue.

---

## Points de vigilance

- **Localisation hybride de `hasPart`** (Tâche 8) : c'est le risque principal. Le mécanisme
  `LOCALIZED_FIELDS` ne suffit pas ; tester explicitement l'édition d'un texte en FR puis le
  passage EN (structure identique, textes distincts) et la sauvegarde multilingue.
- **Forme des médias** : identifiant en base (dashboard) vs `url` attendu côté rendu — la
  résolution se fait en lecture (Tâche 9), coordination directe avec le mapper de **031**.
- **`position`** : recalculer à chaque réordonnancement/suppression pour rester contigu et
  cohérent avec le tri du rendu.
- **Écran Contact** : ne jamais le proposer à la saisie ; il est ajouté au rendu par 031.
- **`additionalType` string** : ne pas le sérialiser en objet (le type d'interface
  `Record<string, unknown>` est trompeur ; la fixture et le POC utilisent une string).

## Hors périmètre

- **Création d'un nouveau bien** (`PropertyCreatorPanel` / `creator.post`) : l'édition des screens
  reste dans le **panneau d'édition** uniquement. Parcours attendu : créer le bien (assistant
  minimal) → puis l'éditer pour ajouter ses screens. Aucun screen à la création pour le moment.
- Rendu public du parcours (tâche **031**).
- Upload de nouveaux médias (déjà couvert par `media/upload.post` + `PropertyMediaPickerModal`).
- Édition de l'écran Contact (auto-ajouté, non éditable).
- Réorganisation drag-and-drop (chevrons monter/descendre suffisent en V1, patron existant).
