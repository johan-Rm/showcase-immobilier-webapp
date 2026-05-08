# Spec : Bootstrap global des donnees core

## Metadonnees

- ID : SPEC-006
- Statut : En cours
- Objectif principal : formaliser le bootstrap reel des donnees core au demarrage de l application et lors des changements de locale

---

## Description rapide

Le bootstrap observe aujourd hui une logique differente de la premiere version de la spec.
L initialisation des donnees core est orchestree dans `app/app.vue` via `useNuxtServerInit()`.
Cette orchestration :

- lit la locale courante via `useLang`
- charge les metadata globales
- charge ensuite les `web pages` et les `accommodations`
- relance explicitement l initialisation lors d un changement de locale

Il n y a pas de plugin `bootstrap.server.ts` actif dans le code courant.

---

## Probleme ou besoin observe

Le code a converge vers un bootstrap applicatif centralise, mais la spec ne decrit plus cet etat reel.
Elle ne permet donc plus de verifier correctement :

- l ordre de chargement des donnees
- la responsabilite de `app.vue`
- le role de `useNuxtServerInit`
- le comportement attendu lors d un changement de locale

---

## Perimetre

Dans le scope de cette spec :

- initialisation globale depuis `app/app.vue`
- orchestration `useNuxtServerInit`
- chargement `metadata`, `web pages`, `accommodations`
- reinitialisation sur changement de locale
- articulation avec `services/content/loaders.ts`, `useWebPage`, `useAccommodation` et les stores associes

Hors scope :

- optimisation fine des caches
- background tasks futures encore vides
- ajout de nouvelles ressources non chargees aujourd hui

---

## Contraintes

- le bootstrap doit rester SSR-safe
- l ordre de chargement doit rester explicite : metadata avant donnees dependantes
- le changement de locale doit produire un etat coherent
- les pages ne doivent pas dupliquer la logique de chargement principal
- les loaders de contenu restent la source de lecture des fichiers `content/*`

---

## Criteres d acceptation

- `app/app.vue` attend `initCoreData()` avant le rendu des pages
- `useNuxtServerInit` charge d abord les metadata puis les donnees principales
- `loadMainData()` charge au minimum `web pages` et `accommodations`
- un changement de locale relance `initCoreData()`
- les pages principales consomment ensuite les stores et composables sans reimplementer le bootstrap
- aucune reference normative active n exige un plugin `bootstrap.server.ts` absent du repo

## Points de vigilance

- SSR et hydratation
- coherence du state lors d un changement de locale
- duplication de responsabilite entre bootstrap, composables et pages
- cout de rechargement complet lors d un changement de langue
