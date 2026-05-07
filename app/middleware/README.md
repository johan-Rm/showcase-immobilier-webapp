---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/middleware/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `middleware`

## 1. Rôle et responsabilités

- Gérer les garde-fous de navigation avant l’affichage des pages.
- Vérifier des conditions d’accès et appliquer des redirections.
- Exécuter une logique commune à plusieurs routes (auth, locale, maintenance).
- Middleware globaux (`.global.ts`) exécutés à chaque navigation.
- Middleware nommés à déclarer via `definePageMeta({ middleware })`.

---

## 2. Bonnes pratiques

- Un middleware = une responsabilité ; exécution rapide.
- Utiliser `navigateTo` / `abortNavigation` pour rediriger/stopper.
- Éviter `useRoute()` dans le middleware ; utiliser `to`/`from`.
- Journalisation minimale, gestion d’erreurs explicite.

## 3. Conventions de nommage

- Fichiers en `kebab-case.ts`.
- Suffixe `.global.ts` pour les middlewares globaux.
- Noms descriptifs (ex. `auth.ts`, `locale.ts`).

## 4. Performance

- Code bref, sans I/O bloquante ; limiter les dépendances lourdes.
- Ordonnancer les globaux au besoin via préfixe (`01.setup.global.ts`).

## 5. Structure et organisation

- Racine `app/middleware/` scannée ; globaux exécutés avant les nommés.
- Déclarer les nommés dans `definePageMeta` (ou via `addRouteMiddleware`).
- Exemples globaux : `maintenance.global.ts`, `locale-global.ts`.

---

### Ex. : Structure de template

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const isAuth = false
  if (!isAuth && to.path !== '/login') return navigateTo('/login')
})
```
