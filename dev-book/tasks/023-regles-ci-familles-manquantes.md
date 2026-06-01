---
status: Todo
doc: docs/3.application/ci-conventions-validation.md
---

# 023 Regles CI — familles manquantes

## Intention

Completer le systeme de validation YAML (`scripts/ci/app/rules.yaml`) introduit par TASK-003
et etendu par TASK-004 en couvrant les familles de controles non encore adressees.

Le moteur YAML est en place. Cette tache ajoute uniquement des regles nouvelles dans les
familles suivantes, qui n existent pas encore dans `rules.yaml` :

- **Performance & Stabilite**
- **Robustesse & Fiabilite**
- **Tests**
- **Documentation**
- **Gouvernance Technique**

Complement sur les familles deja presentes : taille des fonctions et nombre de parametres,
qui sont absents des regles actuelles alors que taille des composants est deja couverte.

## Hors perimetre

- Modifier le moteur `validation-rules.ts` ou les scripts existants.
- Corriger les violations detectees par les nouveaux checks.
- Couvrir des regles deja presentes dans `rules.yaml` (voir TASK-003 et TASK-004).
- Remplacer SonarQube Cloud (TASK-004) — ces regles sont complementaires, pas concurrentes.

## Regles a implementer

### Performance & Stabilite

**`app-no-unhandled-fetch`** `requiresManualReview: true`
Detecte les appels `$fetch(` ou `useFetch(` sans bloc `try/catch` ni option `onResponseError`
ni destructuration `{ error }` dans `server/api/` et les composables.
Une requete sans gestion d erreur silentie les echecs reseau cote client.

**`app-no-console-in-production`** `requiresManualReview: false`
Detecte `console.log(`, `console.warn(`, `console.error(` hors blocs conditionnes par une
variable d environnement ou un flag `import.meta.dev`.
Les logs debug ne doivent pas partir en production.

**`app-large-server-route`** `requiresManualReview: true`
Detecte les fichiers `server/api/**/*.ts` depassant un seuil de lignes (ex. 80).
Une route qui grossit fait souvent de la logique metier — renvoyer vers un service.

### Robustesse & Fiabilite

**`app-empty-catch`** `requiresManualReview: true`
Detecte les blocs `catch` vides ou avec uniquement un commentaire dans `.ts` et `.vue`.
Une exception silencieuse masque les erreurs et rend le debug impossible.

**`app-no-magic-numbers`** `requiresManualReview: true`
Detecte les litteraux numeriques significatifs (hors 0, 1, -1, 100) non assignes a une
constante nommee dans les fichiers `.ts` et blocs `<script>` `.vue`.
Un nombre magique est une contrainte metier sans nom et sans contexte.

**`app-excessive-parameters`** `requiresManualReview: true`
Detecte les fonctions et composables avec plus de 4 parametres.
Signe d une fonction qui fait trop de choses ou d un objet de configuration manquant.

### Tests

**`app-composable-without-test`** `requiresManualReview: true`
Pour chaque fichier `app/composables/use*.ts`, verifie qu un fichier de test correspondant
existe dans `app/composables/` ou `tests/` (pattern `use*.test.ts` ou `use*.spec.ts`).
Les composables encapsulent la logique — ils doivent etre testables et testes.

**`app-server-route-without-test`** `requiresManualReview: true`
Pour chaque fichier `server/api/**/*.ts`, verifie qu un fichier de test correspondant existe
dans `tests/` ou `server/`.
Les routes serveur exposent du comportement observable — a couvrir en priorite.

### Documentation

**`app-composable-missing-jsdoc`** `requiresManualReview: true`
Detecte les composables exportes (`export function use`, `export const use`) sans commentaire
JSDoc (`/** ... */`) dans `app/composables/`.
Un composable sans documentation force a lire son implementation pour comprendre son contrat.

**`app-large-function`** `requiresManualReview: true`
Detecte les fonctions depassant un seuil de lignes (ex. 30) dans `.ts` et blocs `<script>`
`.vue`, hors composants Vue (deja couverts par `app-large-component`).
Une fonction longue est un signal de lisibilite et de testabilite.

### Gouvernance Technique

**`app-no-hardcoded-secrets`** `requiresManualReview: false`
Detecte les patterns caracteristiques de secrets en clair : tokens, mots de passe, cles API
(patterns `password\s*=\s*["']`, `token\s*=\s*["']`, `api_key\s*=\s*["']`, etc.) dans les
fichiers commites.
Un secret commit est une fuite — irreversible une fois pousse.

**`app-env-access-in-app`** `requiresManualReview: false`
Detecte `process.env.` dans `app/` (hors `nuxt.config.ts`).
Les variables d environnement ne sont pas accessibles cote client sauf exposition explicite
via `runtimeConfig` — acceder a `process.env` dans `app/` est silencieux ou source de fuite.

**`app-no-debug-directives`** `requiresManualReview: false`
Detecte les directives Vue de debug (`v-show="true"`, `:key="Math.random()"`, `v-once` sur
des donnees dynamiques) dans les templates `.vue`.
Ces patterns sont des residus de debug qui degradent le comportement en production.

## Etapes

### 1. Conventions README

- Documenter les nouvelles conventions dans `app/README.md` pour les regles scopees a `app/`.
- Documenter les regles `server/` dans `server/README.md`.
- Documenter les regles de gouvernance dans le README racine si elles couvrent tout le projet.

### 2. Regles YAML

- Ajouter chaque regle dans `scripts/ci/app/rules.yaml`.
- Respecter les champs obligatoires : `name`, `requiresManualReview`, `severity`, `description`.
- Calibrer les seuils sur le code existant avant de commiter.

### 3. Scripts CI

- Creer un script par regle ou par famille selon la complexite dans `scripts/ci/app/`.
- Chaque script utilise `loadValidationRule` depuis `validation-rules.ts`.
- Les scripts `requiresManualReview: false` retournent un code non nul en cas de violation.
- Les scripts `requiresManualReview: true` affichent les occurrences sans bloquer.

### 4. Workflow CI/CD

- Ajouter les nouveaux checks dans le workflow conventions.
- Les regles `requiresManualReview: false` doivent bloquer le workflow.
- Les regles `requiresManualReview: true` doivent produire un rapport sans bloquer.

## Criteres d acceptation

- Chaque regle est documentee dans le README local concerne.
- Chaque regle est declaree dans `rules.yaml` avec tous les champs obligatoires.
- Chaque script lit sa configuration depuis le YAML via `loadValidationRule`.
- Les regles `requiresManualReview: false` bloquent le CI en cas de detection.
- Les regles `requiresManualReview: true` signalent sans bloquer.
- Les tests et checks existants continuent de passer.

## Points de vigilance

- Calibrer les seuils (lignes, nombre de parametres) sur le code existant pour eviter
  un bruit excessif au premier run — un check bruitage sera desactive.
- La detection de secrets en clair doit avoir un faible taux de faux positifs : cibler
  les patterns d assignation, pas les noms de variables generiaux.
- `app-composable-without-test` et `app-server-route-without-test` sont heuristiques : le
  nom du fichier de test peut varier selon la convention du contributeur.
- Ces regles sont complementaires a SonarQube Cloud (TASK-004) : SonarQube couvre la
  couverture de code et la duplication, ces regles couvrent les conventions projet specifiques.
