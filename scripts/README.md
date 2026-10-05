---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/scripts/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

`setup-local.ts` prépare les données fictives et `.env` sans API ni secret hérité.
Il refuse d’écraser des données non fictives. `run-schema-hook.mjs` génère les
contrats YAML locaux. Lancer `bun run setup:local` après installation.

Le contrôle `check:app:types` applique la règle de placement aux types manuels.
Les dossiers de contrats générés sont déclarés dans
`scripts/ci/app/rules.yaml` (`generatedTypesDirs`) et restent dans leur couche
`schemas/`. Les doublons et imports de types manuels continuent d'être contrôlés.
