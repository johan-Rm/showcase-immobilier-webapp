# 🎯 Spec : Internationalisation (i18n Nuxt)

## 🔖 Métadonnées

- **ID** : SPEC-004
- **Statut** : En cours (socle minimal, structure/clé non documentées)
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si le choix de module i18n ou la stratégie de chargement évolue.
- **Objectif principal** : Offrir un socle i18n Nuxt 4 fiable, extensible et performant (config module + structure des traductions).

---

## 1. Description rapide

Module `@nuxtjs/i18n` activé (locales `fr`/`en`, stratégie `prefix`, détection navigateur optionnelle) avec messages TS rudimentaires dans `content/{locale}/messages.ts`. Middleware global redirige vers `/fr` si la locale manque. Composable partagé `useLang` (VueUse) synchronise `localeSetting` (state), `useI18n().locale` et les routes nommées (`getLocalizedRoute` ajoute le suffixe `___{locale}`). Conventions ajoutées pour organiser les messages par domaine (dossier `content/{locale}/messages/` agrégé par `messages.ts`) et pour nommer les clés (namespace par domaine, clés stables).

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que dev, je configure les locales (default + secondaires) et je peux changer de langue avec persistance côté client.
- **US2 (P1)** : En tant que dev, je range les traductions et contenus localisés dans `content/{lang}/` (messages génériques, pages, blocs) et je les charge via i18n/Content de façon déterministe.
- **US3 (P2)** : En tant que dev, j’ai des conventions pour traduire composants/pages (clés stables, fallback, pluralisation) et une doc courte pour éviter les erreurs.

---

## 3. Critères d’acceptation (succès)

- **CA1** : `nuxt.config.ts` configure `@nuxtjs/i18n` (locales `fr/en`, `defaultLocale: 'fr'`, `strategy: 'prefix'`, `langDir: 'content'`, `detectBrowserLanguage` avec cookie `i18n_redirected`).
- **CA2** : Messages de base stockés dans `content/{locale}/messages.ts` (TS simple) ; conventions prévues pour répartir les messages par domaine dans `content/{locale}/messages/` et les agréger.
- **CA3** : Middleware global `app/middleware/locale.global.ts` force la redirection vers `/fr` si aucune locale supportée n’est détectée (logs serveur activés).
- **CA4** : `useLang` (singleton via `createSharedComposable`) expose `t`, `localeSetting`, `availableLocales`, `getLocalizedRoute` (suffixe `___{locale}`), synchronise route/locale et détermine la locale initiale (route > navigateur > fallback `fr`).
- **CA5** : Documentation projet présente sur `useLang` + routes localisées et conventions de clés/messages (cf. `app/composables/README.md`), en cohérence avec la structure `content/{locale}/messages.ts`.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Nuxt 4 et Bun sont déjà installés.
- HYP-002 : L’arborescence `content/{lang}/` est disponible et suit les conventions décrites dans `content/README.md`.
- HYP-003 : Les locales cibles initiales sont connues (au moins `fr` + `en`).

### Contraintes techniques (TECH)

- TECH-001 : Utiliser le module i18n Nuxt 4 officiel (ou compatible) avec support Vue 3 / Composition API, configuration centralisée dans `nuxt.config.ts` (pas de fichier `vueI18n` séparé).
- TECH-002 : Les clés i18n doivent être stables et partagées entre locales ; pas de magic strings dans les composants/pages.
- TECH-003 : Les fichiers de traductions doivent être organisés par domaine (messages génériques vs pages vs components) en cohérence avec `content/{lang}/`.
- TECH-004 : Activer un fallback déterministe ; gérer pluralisation et formats via i18n (pas de logique dispersée dans les composants).
- TECH-005 : Prévoir lazy-loading ou split des locales pour éviter un bundle trop lourd.
- TECH-006 : Composable `useLang` doit s’appuyer sur `@nuxtjs/i18n` (vue-i18n) et `useState('locale.setting')` pour la locale active ; `getLocalizedRoute` doit supporter routes nommées et params par langue ; implémentation partagée via `createSharedComposable` (singleton).

---

## 5. Plan d’implémentation (ultra-synthétique)

- Ajouter/configurer le module i18n Nuxt (locales, defaultLocale, strategy, lazy) directement dans `nuxt.config.ts` (sans `vueI18n` séparé).
- Structurer les traductions dans `content/{lang}/` (messages.yml, pages/, components/, metadata/) et définir l’agrégation dans `content/{lang}/index.ts`.
- Définir conventions de clés (namespaces par domaine/page, kebab/camel, stabilité des identifiants).
- Implémenter `useLang` (t, localeSetting, availableLocales, getLocalizedRoute, détection + redirect `/` -> `/{locale}`) en singleton partagé (`createSharedComposable`) + exemples d’usage.
- Gérer pluralisation/formatage (dates/nombres) via i18n ; prévoir exemples.
- Documenter l’usage (README i18n ou section dédiée) + exemples d’appel dans un composant/page.

---

## 6. Tâches à réaliser

- [x] **T1 – Déps & config** : Ajouter le module i18n Nuxt 4, configurer locales/default/fallback/strategy/lazy.
- [ ] **T2 – Structure contenu** : Organiser les fichiers de traduction dans `content/{lang}/` (messages par domaine + agrégation `messages.ts`, pages/, components/, metadata/) avec mirroring strict entre langues.
- [x] **T3 – Conventions clés** : Définir/documenter les conventions de nommage (namespaces, clés stables, pluralisation, formats).
- [x] **T4 – Composable `useLang`** : Implémenter `useLang` (t, localeSetting state, availableLocales map, getLocalizedRoute avec params par langue, détection route/navigateur, redirect `/` -> `/{locale}`) en singleton partagé via `createSharedComposable`.
- [ ] **T5 – Exemples & tests** : Ajouter un ou deux exemples (composant/page) illustrant `useLang`, pluralisation, formats ; vérifier chargement par locale, routes nommées `___{locale}`, redirections.
- [x] **T6 – Doc** : Mettre à jour la doc projet (section i18n) avec structure, commandes, `useLang` (singleton), et bonnes pratiques ; formaliser une note dédiée si une décision déroge.

---

## 7. Notes / Risques

- RISK-001 : Poids du bundle si les locales sont chargées en bloc (mitiger via lazy-loading/split).
- RISK-002 : Divergence de structure entre langues si l’arborescence `{lang}` n’est pas synchronisée.
- RISK-003 : Magic strings dans les composants si les conventions de clés ne sont pas respectées (à surveiller via lint/review).

> Formaliser une note de décision dédiée si un choix de module, de stratégie de chargement ou de structure s’écarte des conventions standard.
