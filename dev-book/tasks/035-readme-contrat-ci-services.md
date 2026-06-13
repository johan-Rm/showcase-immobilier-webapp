---
status: In progress
doc: docs/3.application/ci-conventions-validation.md
---

# 035 README contrat 2 chapitres et couverture CI (slice services)

## Intention

Faire des `README.md` de dossier un contrat d'architecture strict et controle, pas de la
documentation passive. Chaque README suit deux chapitres : `Role et responsabilites` puis
`Conventions techniques`. Les conventions techniques automatisables sont protegees par des
scripts CI, sur le modele deja en place pour `app/`.

Cette tache initialise le chantier et livre la premiere slice verticale : `services/`.

## Constat

- seul `app/README.md` suit le modele 2 chapitres ; les 12 autres README sont au format
  generique 5 sections (ou vides, comme `services/`).
- seul `app/` est couvert par des scripts CI (`scripts/ci/app/`). `services/`, `server/` et
  `shared/` n'ont aucun controle.

## Perimetre (slice services)

- acter le modele strict 2 chapitres dans `docs/3.application/ci-conventions-validation.md`
- reecrire `services/README.md` au modele 2 chapitres
- creer `scripts/ci/services/rules.yaml` et au moins une regle deterministe
- creer le script `verify-no-framework-imports.ts` (zero import Vue/Nuxt/Pinia dans `services/`)
- brancher le check dans `package.json` et `.github/workflows/conventions.yml`
- deplacer `services/hooks/schema.ts` (hook de build Nuxt, non framework-agnostic) vers
  `scripts/build/schema-hook.ts` pour respecter le contrat strict de `services/`

## Hors perimetre

- reecrire les README des autres couches (slices suivantes : server, shared, app/\*)
- extraire un moteur de validation partage `scripts/ci/lib/` (refactor dedie ulterieur)
- ajouter une dependance
- corriger les violations applicatives detectees

## Etapes

### 1. Documentation du contrat

- ajouter la section `README Contract` dans `ci-conventions-validation.md`
- definir les deux chapitres obligatoires et leur ordre

### 2. README services

- reecrire `services/README.md` : `Role et responsabilites` + `Conventions techniques`
- chaque convention courte renvoie vers `docs/` quand un contexte est necessaire

### 3. Regles CI services

- `scripts/ci/services/rules.yaml` : regle `services-no-framework-imports`
- `scripts/ci/services/verify-no-framework-imports.ts` : lecture YAML + controle deterministe

### 4. Branchement CI

- script `check:services:no-framework-imports` dans `package.json`
- ajout du run dans le job `conventions`

## Slices suivantes (backlog)

- `server/` : README 2 chapitres + regles BFF
- `shared/` : README 2 chapitres + regles
- harmonisation des README `app/*` (composants, pages, stores...) au modele 2 chapitres
- extraction d'un loader de regles partage entre couches
