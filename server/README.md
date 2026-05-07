---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/server/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `server`

## 1. Rôle et responsabilités

- Héberger les routes et handlers serveur (API, routes sans préfixe, middleware).
- Exposer les endpoints consommés par l’app (JSON, status codes).
- Encapsuler la logique backend (validation, orchestration de services, accès données).
- Étendre le runtime Nitro via plugins et utilitaires serveur.

---

## 2. Bonnes pratiques

- Un fichier = une responsabilité claire (route, middleware, plugin).
- Validation des entrées ; erreurs explicites (`createError` / codes HTTP adaptés).
- Séparer la logique métier dans `server/services` ou `server/utils` pour éviter la duplication.
- Journalisation minimale et utile ; éviter les fuites de données sensibles.

## 3. Conventions de nommage

- Routes API dans `server/api/*.ts` ou arborescence reflétant l’URL (`users/[id].ts`, `foo/bar.get.ts`).
- Routes sans préfixe dans `server/routes/` (ex. `hello.ts` → `/hello`).
- Middlewares globaux dans `server/middleware/*.ts` (ne renvoient pas de réponse).
- Plugins Nitro dans `server/plugins/*.ts` (`defineNitroPlugin`).

## 4. Performance

- Handlers courts, I/O non bloquantes ; limiter la taille des réponses.
- Utiliser `event.waitUntil` pour les tâches async post-réponse (logs, cache).
- Prefetch/timeout côté services pour éviter les blocages.

## 5. Structure et organisation

- `server/api/` : routes préfixées `/api`.
- `server/routes/` : routes sans préfixe.
- `server/middleware/` : middlewares exécutés sur chaque requête.
- `server/plugins/` : extensions Nitro.
- `server/utils/` : helpers serveur ; logique métier partagée dans `server/services/` si besoin.

---

### Ex. : Structure de template

```ts
// server/api/health.get.ts
export default defineEventHandler(() => ({ status: 'ok', timestamp: Date.now() }))
```
