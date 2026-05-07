# Dossier Specs

Ce dossier contient les specifications fonctionnelles du projet.

Une spec de ce dossier decrit une intention et un objectif, puis cadre le perimetre, les criteres d'acceptation et le plan d'execution utile.

Chaque specification doit etre documentee dans un fichier separe.

Constitution du projet : `.codex/constitution.md`.

Convention de nommage : `NNN-titre.md` (NNN = numero sequentiel, titre en kebab-case).

Exemples :

- `001-getting-started.md`
- `002-linter-formatting.md`
- `023-socle-seo-complet-par-page.md`

## Creer une nouvelle spec

1. Prendre un numero libre.
2. Creer un fichier `NNN-titre.md`.
3. Renseigner au minimum : metadonnees, intention, objectif principal, user stories, criteres d'acceptation, contraintes et plan d'execution si necessaire.

## Statuts

Une spec passe par : **Propose -> En cours -> Termine**.
Une spec est "terminee" si : criteres d'acceptation OK + tests critiques OK + quality gates OK.

## Quality Gates

Toute spec est consideree "terminee" uniquement si les controles qualite passent :

- `bun run lint:check`
- `bun run format:check`
- `bun run type-check` (et `bun run quality` si disponible)
