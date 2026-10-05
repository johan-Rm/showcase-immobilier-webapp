# Audit Code Review — Showcase Immobilier

> Branche : `audit/code-review-2026-05-03`  
> Date : 2026-05-03  
> Stack : Nuxt 4 · Vue 3 · TypeScript · Tailwind v4 · Pinia · Zod · Nitro

---

## Résumé exécutif

| Sévérité     | Nombre |
| ------------ | ------ |
| 🔴 Critique  | 14     |
| 🟠 Important | 28     |
| 🟡 Mineur    | 22     |
| **Total**    | **64** |

---

## 🔴 Problèmes Critiques

### Sécurité

#### [SEC-01] XSS via `innerHTML` dans `useTypewriter.ts`

- **Fichier :** `app/composables/useTypewriter.ts` (ligne 58)
- **Problème :** `tempDiv.innerHTML = textToAnimate.substring(0, index)` — si `initialText` provient d'une API ou d'un utilisateur, cela contourne les protections XSS de Vue.
- **Fix :** Utiliser `textContent` pour du texte pur, ou sanitiser avec DOMPurify si le HTML est requis.

#### [SEC-02] Pas de validation Zod sur le payload du formulaire de contact

- **Fichier :** `server/api/contact.post.ts` (ligne 243)
- **Problème :** `readBody<ContactPayload>(event)` cast TypeScript sans jamais valider la structure avec Zod. N'importe quel JSON est accepté.
- **Fix :** Créer `shared/schemas/contact.ts` et appeler `contactSchema.safeParse(body)` avant tout traitement.

#### [SEC-03] Pas de rate limiting sur `/api/contact`

- **Fichier :** `server/api/contact.post.ts`
- **Problème :** Aucune protection anti-spam / DDoS. Soumissions illimitées possibles.
- **Fix :** Ajouter un middleware de rate limiting IP ou token-based.

#### [SEC-04] Injection de formule CSV

- **Fichier :** `server/api/contact.post.ts` (lignes 100-106)
- **Problème :** `escapeCsvValue()` échappe les guillemets mais pas les préfixes `=`, `+`, `@`, `-` qui activent des formules dans Excel.
- **Fix :**
  ```typescript
  if (/^[=+@-]/.test(escaped)) escaped = `'${escaped}`
  ```

#### [SEC-05] Validation email trop permissive

- **Fichier :** `server/api/contact.post.ts` (ligne 266)
- **Problème :** Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` accepte `test@test.c` ou `a@b.c`.
- **Fix :** Utiliser `z.string().email()` de Zod ou une regex RFC 5322.

#### [SEC-06] En-têtes de sécurité manquants

- **Fichier :** `nuxt.config.ts`
- **Problème :** Aucun `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Fix :** Ajouter dans `nitro.headers` ou `routeRules`.

#### [SEC-07] Validation côté client uniquement du honeypot

- **Fichier :** `app/composables/useContactForm.ts` (lignes 19-23)
- **Problème :** Le champ honeypot (`website`) est vérifié seulement côté client. Un bot peut contourner en appelant l'API directement.
- **Fix :** Déplacer la vérification du honeypot **uniquement** dans `server/api/contact.post.ts`.

### Routing & Navigation

#### [ROUTE-01] Boucle de redirection potentielle dans `locale.global.ts`

- **Fichier :** `app/middleware/locale.global.ts` (ligne 32-53)
- **Problème :** Si `localeSetting.value` est vide ou `undefined`, la redirection produit `/undefined/...` ce qui peut créer une boucle infinie.
- **Fix :** Valider que `locale` est non-vide avant `navigateTo`.

#### [ROUTE-02] Sitemap avec URL localhost hardcodée

- **Fichier :** `server/api/__sitemap__/urls.get.ts` (lignes 3-4)
- **Problème :** `http://localhost:3000` hardcodé — le sitemap est cassé en production.
- **Fix :** Utiliser `getRequestURL(event)` ou `useRuntimeConfig().public.siteUrl`.

#### [ROUTE-03] Erreur 404 levée trop tard dans `[...page].vue`

- **Fichier :** `app/pages/[...page].vue` (ligne 65-67)
- **Problème :** `createError()` est appelé APRÈS que les computed sont initialisés. La page est partiellement rendue avant l'erreur.
- **Fix :** Valider le slug via `definePageMeta({ validate })` pour un rejet précoce.

### Mémoire & Fuites

#### [MEM-01] `defineEmits` manquant dans `PropertyDetail.vue`

- **Fichier :** `app/components/property/DetailPanel.vue`
- **Problème :** `emit('next-screen')` utilisé sans `defineEmits`. Vue émet un avertissement et le typage est perdu.
- **Fix :**
  ```typescript
  const emit = defineEmits<{ (e: 'next-screen'): void }>()
  ```

#### [MEM-02] Timer de galerie pouvant s'exécuter après démontage

- **Fichier :** `app/components/property/DetailPanel.vue` (lignes 468-502)
- **Problème :** Le callback du timer peut s'exécuter après le démontage du composant si une navigation rapide survient, causant des erreurs sur des refs détruites.
- **Fix :** Vérifier `if (!el) return` au début du callback, et utiliser `ref<ReturnType<typeof setTimeout> | null>`.

#### [MEM-03] Intervalle autoplay non nettoyé sur changement de `data`

- **Fichier :** `app/components/screen/PanelScrollDualSynced.vue` (ligne 60)
- **Problème :** Quand `props.data` change, l'ancien intervalle n'est pas stoppé avant d'en démarrer un nouveau.
- **Fix :** `watch(() => props.data, () => { stopAutoplay(); startAutoplay() })`

---

## 🟠 Problèmes Importants

### SEO

#### [SEO-01] Open Graph et balises Twitter absentes au niveau global

- **Fichier :** `app/app.vue` (lignes 102-127)
- **Fix :** Ajouter `og:title`, `og:description`, `og:image`, `og:type`, `og:url` dans `useHead()`.

#### [SEO-02] Pas de données structurées Schema.org

- **Problème :** Aucun `ld+json` pour `Organization`, `LocalBusiness`, ou `Product/Property`.
- **Fix :** Ajouter dans les pages concernées via `usePageSeo()` ou directement dans `useHead()`.

#### [SEO-03] URL canonique absente sur les pages avec i18n

- **Problème :** Sans canonical, Google indexe les versions `/fr/...` et `/en/...` comme contenu dupliqué.
- **Fix :** Ajouter `<link rel="canonical" :href="currentUrl" />` dans `usePageSeo()`.

### i18n

#### [I18N-01] Chaînes françaises hardcodées dans les pages et composants

- **Fichiers :** `app/pages/echo.vue`, `app/error.vue`, `app/components/property/DetailPanel.vue` (ligne ~204 : "Intéressé ?")
- **Fix :** Passer par les clés de traduction `$t('...')`.

#### [I18N-02] Routes dynamiques absentes de la config i18n

- **Fichier :** `nuxt.config.ts` (lignes 144-166)
- **Problème :** Seule `properties/[realEstateListing]/index` est mappée. Contact, property detail, category pages absents.
- **Fix :** Compléter les routes dans la config `@nuxtjs/i18n`.

#### [I18N-03] Messages d'erreur 404 non localisés

- **Fichier :** `app/pages/properties/.../[accommodationSlug].vue` (ligne 62)
- **Fix :** `createError({ statusMessage: t('errors.not_found') })`

### Accessibilité

#### [A11Y-01] H1 invisible si `accessibleTitle` est undefined

- **Fichier :** `app/pages/index.vue`, `app/pages/contact.vue`
- **Problème :** `<h1 v-if="accessibleTitle" class="sr-only">` — si `accessibleTitle` est undefined, aucune h1 n'existe dans la page.
- **Fix :** Garantir une valeur par défaut pour `accessibleTitle`.

#### [A11Y-02] Pas d'`aria-live` sur les états de chargement/erreur de formulaire

- **Fichier :** `app/pages/echo.vue` (lignes 34-54)
- **Fix :** Ajouter `aria-live="polite"` sur les divs de succès/erreur.

#### [A11Y-03] Alt text vide ou "empty" sur des images fonctionnelles

- **Fichiers :**
  - `app/components/screen/Contact.vue` (ligne 7) : `alt="empty"`
  - `app/components/navigation/Main.vue` (ligne 199) : `alt=""` sur l'image du lien home
- **Fix :** Alt texte descriptif ou, si décoratif, `role="presentation"` explicite.

### Architecture

#### [ARCH-01] Pages surchargées (too much responsibility)

- **Fichier :** `app/pages/contact.vue`, pages properties
- **Problème :** Chaque page gère : chargement des données, validation, SEO, screen system, navigation. `useScreenSystem()` est dupliqué 5+ fois avec la même config.
- **Fix :** Créer un composant wrapper `PageWithScreenSystem.vue` ou un composable `usePageSetup()`.

#### [ARCH-02] Footer dupliqué dans toutes les pages

- **Problème :** `<LazyScreenFooter />` et `<LazyScreenRealEstateThreeColProperties />` sont inclus manuellement dans chaque page au lieu d'être dans le layout.
- **Fix :** Les intégrer dans `app/layouts/default.vue`.

#### [ARCH-03] Aliases d'import fragmentés

- **Fichier :** `nuxt.config.ts` (lignes 106-117)
- **Problème :** `~/*`, `@/*`, `@schemas/*`, `@services/*`, `@utils/*` — convention non documentée.
- **Fix :** Standardiser sur `@/*` et documenter dans `README.md`.

### Gestion d'erreurs

#### [ERR-01] Erreurs silencieuses dans `useContactForm.ts`

- **Fichier :** `app/composables/useContactForm.ts` (lignes 38-42)
- **Problème :** Le `catch` n'enregistre pas l'erreur originale — débogage impossible en production.
- **Fix :** `console.error('Contact form failed:', error)` dans le catch.

#### [ERR-02] `useAsyncData` sans gestion d'erreur sur les pages properties

- **Fichier :** `app/pages/properties/.../[accommodationSlug].vue` (lignes 37-48)
- **Problème :** Si `loadAccommodations()` échoue, la page casse sans message utilisateur.
- **Fix :** Utiliser le retour `{ error }` de `useAsyncData` et afficher un état d'erreur.

#### [ERR-03] `onErrorCaptured` empêche l'affichage de `error.vue`

- **Fichier :** `app/app.vue` (lignes 89-100)
- **Problème :** `return false` empêche l'erreur d'atteindre la page d'erreur Nuxt. Les composants cassés affichent une page blanche.
- **Fix :** Logger l'erreur mais ne pas retourner `false`, ou re-throw vers le handler Nuxt.

#### [ERR-04] Erreurs de contenu exposées au client

- **Fichier :** `server/utils/content/loaders.ts` (lignes 72-74)
- **Problème :** `throw new Error('Frontmatter manquant dans "${source}"')` révèle des chemins de fichiers.
- **Fix :** Logger server-side, retourner une erreur générique au client.

### TypeScript

#### [TS-01] `any` dans le handler sitemap

- **Fichier :** `server/api/__sitemap__/urls.get.ts` (lignes 8, 9, 16)
- **Fix :** Définir des types DTOs pour `Accommodation` et `WebPage`.

#### [TS-02] Validation sans Zod sur les fichiers de contenu

- **Fichier :** `server/utils/content/loaders.ts` (lignes 99-106)
- **Fix :** Post-valider les fichiers YAML/Markdown parsés avec des schémas Zod.

---

## 🟡 Problèmes Mineurs

### Code mort

| #         | Fichier                                        | Problème                                                                 |
| --------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| [DEAD-01] | `app/components/screen/ContactOld.vue`         | Composant probablement inutilisé (nom explicite). Vérifier et supprimer. |
| [DEAD-02] | `app/components/screen/Footer2.vue`            | Doublon de `Footer.vue`, but flou. Documenter ou supprimer.              |
| [DEAD-03] | `app/pages/index.vue` (ligne 128)              | Ligne commentée `// const { getPageBySlug } = useWebPage()`              |
| [DEAD-04] | `app/composables/usePageSeo.ts` (lignes 85-86) | Code commenté non nettoyé                                                |

### Qualité

| #         | Fichier                               | Problème                                                                                                                      |
| --------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [QUAL-01] | `useScreenSystem.ts`                  | Flags `hasMounted`, `hasInitialized` créés comme `ref()` alors qu'ils n'ont pas besoin de réactivité — utiliser `let` simple. |
| [QUAL-02] | `useScreenSystem.ts` (lignes 826-905) | Ternaires imbriqués illisibles dans le handler wheel. Extraire `resolvePrimaryDelta()`.                                       |
| [QUAL-03] | `app/composables/useContactForm.ts`   | `resetSubmissionState` exportée mais jamais appelée. L'état d'erreur persiste entre soumissions.                              |
| [QUAL-04] | `DetailPanel.vue` (ligne ~124)        | Chaîne Tailwind de 8+ lignes `[&_a]:text-primary [&_blockquote]:...`. Extraire en classe CSS.                                 |
| [QUAL-05] | `PropertyList.vue`                    | Timer IDs stockés en variables de module plutôt qu'en `ref()`.                                                                |

### Nommage incohérent

| #         | Problème                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------- |
| [NAME-01] | `getWebPage()` (store) vs `getPageBySlug()` (composable) — même chose, deux noms.                   |
| [NAME-02] | `imageObjects` (state) vs `getImageObjects` (getter) — préfixe `get` appliqué de façon incohérente. |
| [NAME-03] | `useMetadata` charge 7 types de données différents — nom trop générique.                            |

### SSR / Hydration

| #        | Fichier                                            | Problème                                                        |
| -------- | -------------------------------------------------- | --------------------------------------------------------------- |
| [SSR-01] | `app/composables/useTypewriter.ts` (lignes 47, 57) | Utilise `document` et `setTimeout` sans guard `process.client`. |
| [SSR-02] | `app/components/screen/Contact.vue`                | `ResizeObserver` sans `typeof ResizeObserver !== 'undefined'`.  |

### Configuration

| #         | Fichier          | Problème                                                                                                                      |
| --------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [CONF-01] | `nuxt.config.ts` | Variables d'env `BLUEPRINTS_PATH`, `SCHEMAS_PATH` non validées au démarrage.                                                  |
| [CONF-02] | `nuxt.config.ts` | `(await import('vite-svg-loader')).default()` — import async dans un array Vite plugins peut causer des erreurs silencieuses. |
| [CONF-03] | `.env.example`   | `DIGITAL_ORCHESTRATION_CORE_PATH` optionnel mais des imports conditionnels peuvent échouer si absent.                         |

---

## Plan de remédiation recommandé

### Sprint 1 — Sécurité (bloquant)

1. `[SEC-02]` Validation Zod sur le payload contact
2. `[SEC-01]` Fix XSS `useTypewriter`
3. `[SEC-04]` Fix injection CSV
4. `[SEC-07]` Déplacer honeypot côté serveur
5. `[SEC-06]` Ajouter security headers dans `nuxt.config.ts`

### Sprint 2 — Stabilité

1. `[ROUTE-02]` Fix URL localhost sitemap
2. `[ROUTE-01]` Fix redirect loop locale middleware
3. `[MEM-01]` Ajouter `defineEmits` manquant
4. `[ERR-03]` Fix `onErrorCaptured` masquant error.vue
5. `[ERR-02]` Gestion d'erreur `useAsyncData`

### Sprint 3 — SEO & i18n

1. `[SEO-01]` Open Graph global
2. `[SEO-02]` Schema.org sur les pages property
3. `[SEO-03]` Canonical URLs
4. `[I18N-01]` Dé-hardcoder les chaînes françaises
5. `[I18N-02]` Compléter routes i18n

### Sprint 4 — Architecture & Qualité

1. `[ARCH-01]` Wrapper page screen system
2. `[ARCH-02]` Centraliser footer dans layout
3. `[A11Y-01]` Garantir h1 visible
4. `[A11Y-02]` `aria-live` sur formulaires
5. Nettoyage code mort `[DEAD-01..04]`
