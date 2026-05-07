---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/plugins/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

<!-- @see official doc -->

# Dossier `app/plugins`

## 1. Rôle et responsabilités

- Enregistrer des plugins Nuxt/Vue auto-chargés à la création de l’app.
- Étendre `nuxtApp`/`vueApp` (injections, directives, libs externes).
- Scoper des plugins côté client ou serveur via suffixe.

---

## 2. Bonnes pratiques

- Un fichier = un plugin ; limiter la logique à l’initialisation.
- Préfixer pour l’ordre de chargement si dépendances (`01.foo.ts`, `02.bar.ts`).
- Utiliser les suffixes `.client.ts` / `.server.ts` pour cibler l’environnement.
- Privilégier les composables pour exposer des helpers plutôt que polluer `provide`.

## 3. Conventions de nommage

- Fichiers en `kebab-case.ts` à la racine (scannés automatiquement).
- Sous-dossiers non scannés par défaut : déclarer dans `nuxt.config` si besoin.
- `my-plugin.client.ts` / `my-plugin.server.ts` pour scoper l’exécution.

## 4. Performance

- Plugins courts ; éviter les imports lourds côté client si non nécessaires.
- Charger en parallèle (`parallel: true`) seulement si aucune dépendance.
- Déclarer `dependsOn` si un plugin attend un autre.

## 5. Structure et organisation

- Racine `app/plugins/` : plugins auto-enregistrés (fichiers de premier niveau).
- Sous-dossiers : optionnels, mais à référencer dans `nuxt.config` pour charger.

---

### Ex. : Structure de template

```ts
// app/plugins/hello.ts
export default defineNuxtPlugin(() => ({
  provide: {
    hello: (msg: string) => `Hello ${msg}!`,
  },
}))
```

## Plugins actifs du projet

- `deferred-runtime.client.ts` :
  - `runtime.page-finished` -> navigation Nuxt terminee (`page:finish`)
  - `deferred.runtime.ready` -> palier post-rendu (2 frames + idle/fallback)
  - `deferred.passive.ready` -> palier passif (interaction
