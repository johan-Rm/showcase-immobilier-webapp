# app/

Couche frontend Nuxt. Contient les pages, composants, composables, stores, layouts, middleware et plugins.

## Rôle et responsabilités

- orchestration du routing et des layouts (`pages/`, `layouts/`)
- rendu UI et composition visuelle (`components/`)
- état global réactif (`stores/`)
- logique transverse et passerelles vers les services (`composables/`)
- initialisation et plugins (`plugins/`)

## Conventions techniques

> Les conventions décrites dans cette section peuvent être vérifiées automatiquement via des scripts CI/CD.
> Les règles concrètes de validation automatisée sont déclarées en YAML dans `scripts/ci/app/`.
> Pour le détail, voir [docs/3.application/ci-conventions-validation.md](../docs/3.application/ci-conventions-validation.md).

### Sur-vérification des variables

Les gardes défensives (`if (!x)`, `x?.y`, `x && x.y`) ajoutées quand une structure de données était instable ou incomplète doivent être supprimées une fois le contrat de type stabilisé.

Un type non-nullable, une prop requise ou une valeur garantie par le contexte d'exécution ne se vérifie pas dans le template ni dans `<script setup>`. Ces vérifications parasites masquent l'intention réelle du code et signalent un type insuffisamment précis plutôt qu'une vraie précaution.

Lorsqu'une vérification est légitime, elle appartient à la couche de validation (boundary API, formulaire, middleware) — pas à la couche d'affichage.

Règle YAML : `app-no-redundant-guards`

### Ordre des blocs dans un fichier Vue

L'ordre des blocs dans un composant Vue est `<template>`, `<script setup lang="ts">`, `<style scoped>`.

Enforcement : règle ESLint `vue/block-order`.

### Structure interne de `<script setup>`

Le contenu de `<script setup lang="ts">` suit un ordre de blocs défini : imports, types et constantes, props et emits, composables et stores, état local, data inputs, helpers purs, computed UI-ready, handlers, watchers, métadonnées de page, lifecycle.

Le template consomme des valeurs déjà préparées. La logique métier ne doit pas fuir dans la couche d'affichage.

@see [docs/2.architecture/6.script-setup-standard.md](../docs/2.architecture/6.script-setup-standard.md)

Règle YAML : `app-script-setup-standard`

### Données prêtes pour le template

Le template ne doit pas contenir de transformation de données non triviale. Il consomme
des labels, nombres formatés, listes filtrées, variantes d'affichage et objets de
présentation déjà préparés.

Exemples à éviter dans le template :

```vue
{{ String(index + 1).padStart(2, '0') }}
{{ items.filter((item) => item.isVisible).length }}
{{ accommodation.price?.toLocaleString(locale) }}
```

Le placement de la transformation dépend de sa portée :

- si la transformation est strictement locale au composant et purement UI, utiliser un
  helper pur ou un `computed` dans le bloc `computed UI-ready`
- si elle est réutilisée par plusieurs composants ou dépend d'une logique réactive
  transverse, la déplacer dans un composable
- si elle dérive un état global partagé, l'exposer via un getter de store
- si elle correspond à une règle métier, un mapping API/contenu ou une normalisation de
  données, la placer dans `services/mapper/` ou dans le service métier approprié

Un composant peut préparer une valeur d'affichage locale, mais il ne doit pas devenir la
couche de normalisation des données. Par défaut, traiter les données le plus haut possible
hors des fichiers dédiés à l'UX/UI, sans créer d'abstraction prématurée pour un cas isolé.

### Images

Toute image affichée dans `app/` passe par le composant `<AppImage>`.

Les balises `<img>`, `<NuxtImg>` et `<NuxtPicture>` sont interdites en dehors de `app/components/AppImage.vue`.

`<AppImage>` doit recevoir ses paramètres via `v-bind` avec un preset nommé issu de `IMAGE_PRESETS` ou `IMAGE_WARMUP_PRESETS`. Les props `width`, `format`, `quality`, `fit`, `sizes` ne doivent pas être écrites en dur.

Règles YAML : `app-images-use-app-image`, `app-images-no-height-prop`

### Logique métier dans les composants

Un composant dans `app/components/` ne doit pas construire de donnée dérivée à partir de l'état global.

Un `computed` ne doit pas combiner une source globale (store Pinia, `appConfig`, composable sans argument) avec une transformation de données (`.map`, `.filter`, `.reduce`, `.push`).

Les données dérivées appartiennent aux getters de store ou aux composables.

Règle YAML : `app-components-no-business-logic`

### Placement des types

Un type TypeScript utilisé par plus d'un fichier doit être défini dans `shared/types/`.

Un type local non exporté reste dans le fichier qui l'utilise.

@see [docs/2.architecture/9.types-placement.md](../docs/2.architecture/9.types-placement.md)

Règle YAML : `app-types-placement`

### Fetch dans les composants

Un composant dans `app/components/` ne doit pas appeler `$fetch`, `useFetch` ou
`useLazyFetch` directement.

Les appels réseau appartiennent aux composables ou aux pages. Un composant reçoit des
données via ses props ou via un composable dédié.

Règle YAML : `app-no-fetch-in-components`

### Mutations de store dans les composants

Un composant dans `app/components/` ne doit pas modifier l'état d'un store directement
(via `.$patch()` ou affectation directe sur un objet de store).

Les composants lisent l'état. Les mutations passent par des actions de store ou des
composables dédiés.

Règle YAML : `app-no-store-write-in-components`

### Composants larges

Un composant Vue dans `app/components/` ne doit pas dépasser 200 lignes.

Un composant qui approche ou dépasse ce seuil fait probablement plusieurs choses. Le
découper en composants de présentation plus petits.

Règle YAML : `app-large-component`

### Composables avec beaucoup de retours

Un composable (`use*.ts`) ne doit pas exposer plus de 8 valeurs dans son `return {}`.

Un composable qui retourne de nombreuses valeurs est souvent plusieurs responsabilités
agrégées. Le découper en composables spécialisés.

Règle YAML : `app-composable-many-returns`
