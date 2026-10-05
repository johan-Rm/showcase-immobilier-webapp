---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/scripts/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

`setup-local.ts` prépare les données fictives et `.env` sans API ni secret hérité.
Il refuse d’écraser des données non fictives. `run-schema-hook.mjs` génère les
contrats YAML locaux. Lancer `bun run setup:local` après installation.
