---
status: Todo
doc: docs/3.application/ci-conventions-validation.md
---

# 029 Quality gates — securite, secrets et code mort

## Intention

Completer les quality gates du projet Nuxt pour couvrir les controles qui existaient dans
la stack Python et qui ne sont pas encore equivalents dans ce depot.

Les controles actuels couvrent deja le formatage, le lint, le typage TypeScript, les
conventions d architecture maison et SonarQube Cloud. Cette tache cible les manques
restants :

- secrets ou mots de passe hardcodes
- audit de securite des dependances
- detection avancee du code mort et des exports inutilises
- clarification du script global de qualite a executer en local et en CI

## Perimetre

- ajouter des scripts npm/Bun explicites dans `package.json`
- ajouter les dependances de developpement strictement necessaires
- ajouter les fichiers de configuration requis par les outils retenus
- brancher les nouveaux checks dans les workflows GitHub Actions pertinents
- documenter le fonctionnement dans la documentation projet existante

## Hors perimetre

- corriger toutes les violations detectees par les nouveaux outils
- remplacer ESLint, Prettier, `vue-tsc`, Vitest ou SonarQube Cloud
- remplacer les scripts maison `scripts/ci/app/*`
- ajouter une plateforme SaaS payante obligatoire
- traiter la rotation d un secret deja fuite si un secret reel est detecte

## Couverture attendue

### Secrets hardcodes

Ajouter un check dedie pour detecter les secrets commitables dans le depot.

Outils candidats :

- `gitleaks`, si l execution locale et CI reste simple
- `secretlint`, si l integration via dependances Node est plus maintenable dans ce projet

Le check doit ignorer les faux positifs attendus comme les exemples documentaires, les
variables d environnement nommees sans valeur secrete et les fichiers generes.

### Audit des dependances

Ajouter un script de securite pour les dependances JavaScript.

Options a evaluer :

- `bun audit`, si la version Bun du projet le supporte correctement
- `npm audit --omit=dev`, uniquement si compatible avec le lockfile et le workflow Bun
- Dependabot ou SonarQube Cloud comme complement CI, sans remplacer le check local

Le choix doit rester compatible avec Bun comme runtime principal.

### Code mort avance

Ajouter un check de type `knip` pour detecter :

- fichiers inutilises
- exports inutilises
- dependances inutilisees
- scripts ou entrees de configuration orphelins, si l outil les supporte sans bruit excessif

Le check doit etre calibre pour Nuxt afin de ne pas signaler a tort les fichiers auto-importes,
les routes `app/pages/`, les conventions Nitro, les contenus Nuxt Content et les schemas
generes.

### Inventaire des auto-imports (calibrage code mort)

Le check de code mort ne peut pas etre calibre sans la liste reelle des symboles
auto-importes par Nuxt : sinon il signale a tort composables, stores, types et composants
comme inutilises. Cette liste sert aussi de reference pour retirer les imports explicites
devenus redondants dans le contexte app.

Action :

- completer `docs/2.architecture/7.auto-imports-and-aliases.md` : references vers la doc
  officielle Nuxt 4 et inventaire concret propre au projet (composables, stores, utils,
  types, server utils, composants), verifie via `bunx nuxi prepare` puis `.nuxt/imports.d.ts`,
  `.nuxt/types/nitro-imports.d.ts` et `.nuxt/components.d.ts`
- acter les exclusions hors auto-import : `services/`, `schemas/interfaces/`, `schemas/dtos/`
- nettoyer les imports redondants de `shared/types/content` (`CreativeWork`, `MenuItem`) dans
  les fichiers app (.vue, composables), en conservant l import explicite dans
  `services/mapper/webPage.ts` (hors auto-import)

### Script global

Clarifier les scripts de qualite :

- conserver `quality:check` pour lint + format + type-check si le projet veut une boucle
  rapide
- ajouter un script plus large, par exemple `quality:full` ou `ci:check`, qui lance aussi
  les checks securite, secrets, code mort et tests utiles
- documenter quel script utiliser en local, en PR et avant merge

## Etapes

### 1. Audit local

- verifier la version Bun et les commandes disponibles
- tester les outils candidats sur le depot
- identifier les faux positifs avant de les rendre bloquants

### 2. Configuration

- ajouter les dependances de developpement retenues
- creer les fichiers de configuration necessaires
- exclure les dossiers generes : `.nuxt`, `.output`, `node_modules`, `dist`, `coverage`
- exclure les artefacts schemas ou contenus uniquement si l outil ne comprend pas leurs
  conventions

### 3. Scripts

- ajouter des scripts dedies, par exemple :
  - `security:check`
  - `secrets:check`
  - `deadcode:check`
  - `quality:full` ou `ci:check`
- garder les noms explicites et reutilisables en CI

### 4. CI

- ajouter les nouveaux checks dans un workflow existant ou un workflow dedie
- eviter de ralentir inutilement la boucle `quality` si un check est couteux
- garder les checks deterministes bloquants
- rendre temporairement non bloquant un check trop bruyant, avec justification documentee

### 5. Documentation

- documenter les nouveaux scripts dans la section projet la plus proche des quality gates
- indiquer les limites connues des outils retenus
- expliquer quoi faire en cas de detection d un secret reel : retirer la valeur, revoquer
  le secret, regenerer, puis verifier l historique Git si necessaire

## Criteres d acceptation

- un check secrets est disponible en local et en CI
- un check securite dependances est disponible ou explicitement documente comme couvert par
  une alternative CI
- un check code mort avance est disponible et calibre pour Nuxt
- l inventaire des auto-imports projet est documente et sert de calibrage au check code mort
- les scripts sont nommes dans `package.json`
- les workflows GitHub Actions lancent les checks retenus
- la documentation indique les commandes a lancer en local et avant PR
- les faux positifs connus sont documentes ou exclus par configuration
- `bun run lint:check`, `bun run format:check` et `bun run type-check` restent inchanges

## Points de vigilance

- Ne pas ajouter un outil qui casse les conventions Nuxt par meconnaissance des auto-imports.
- Ne pas bloquer la CI sur un check de code mort tant que les faux positifs Nuxt ne sont pas
  calibres.
- Ne jamais committer de secret reel dans une fixture de test.
- Si un secret reel est detecte, la correction du code ne suffit pas : il faut aussi revoquer
  le secret cote fournisseur.
- L audit de dependances peut remonter des vulnerabilites dans les dependances de
  developpement ; distinguer le risque runtime du risque tooling avant de bloquer une PR.
