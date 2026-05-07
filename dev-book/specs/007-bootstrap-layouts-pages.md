# 🎯 Spec : Bootstrap layouts & pages

## 🔖 Métadonnées

- **ID** : SPEC-007
- **Statut** : En cours (layouts/pages livrés, home non alimentée faute de données chargées)
- **Décisions structurantes** : Aucune à ce stade.
- **Objectif principal** : Mettre en place les layouts principaux, le routage de base et la page d’accueil alimentée par le store `webPage`.

---

## 1. Description rapide

Remplacer l’écran Nuxt par défaut par des layouts et pages structurées : un layout principal avec navigation localisée et toggle de thème, un layout contact dédié, et des pages d’accueil/about/pocs/contact. La page d’accueil lit la home selon la locale via un composable Pinia, avec CTA vers contact et POCs.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que visiteur, je navigue entre accueil, à propos, POCs et contact depuis une navigation cohérente, adaptée à mon thème (clair/sombre) et ma langue.
- **US2 (P1)** : En tant que visiteur, je vois une page d’accueil personnalisée selon la locale (fr/en) via le contenu du store `webPage`.
- **US3 (P2)** : En tant que visiteur, je bénéficie d’un layout contact distinct pour cette page spécifique.

---

## 3. Critères d’acceptation (succès)

- **CA1** : `app/app.vue` utilise `NuxtLayout`/`NuxtPage` (plus de `NuxtWelcome`) et log de chargement présent.
- **CA2** : `app/layouts/default.vue` offre navigation locale via `useLang` + `useLocalePath`, toggle dark/light via `useColorMode`, header/footer stylés.
- **CA3** : `app/layouts/contact.vue` existe, avec navigation simple et footer.
- **CA4** : Pages `app/pages/index.vue`, `about.vue`, `pocs.vue`, `contact.vue` créées ; `contact.vue` utilise le layout `contact`.
- **CA5** : La page d’accueil appelle `useWebPage().getHomePage()` et affiche le contenu s’il existe, sinon des chaînes de fallback (“Nuxt Tech Lab”, description/CTA statiques).
- **CA6** : Le composable `app/composables/useWebPage.ts` expose `items/current/loaded` du store et la méthode `getHomePage` basée sur les slugs localisés (`accueil`/`home`), mais ne déclenche pas de chargement du store.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Le store `useWebPagesStore` et les données `WebPage` sont disponibles et chargées.
- HYP-002 : `useLang` et `useLocalePath` sont configurés pour gérer les locales (fr/en).
- HYP-003 : Tailwind et `useColorMode` sont déjà configurés pour gérer les classes clair/sombre.

### Contraintes techniques (TECH)

- TECH-001 : Utiliser `NuxtLayout`/`NuxtPage` et les composables Nuxt standards (`useLocalePath`, `useColorMode`).
- TECH-002 : Navigation et CTA doivent être localisés via `localePath`.
- TECH-003 : Le composable `useWebPage` doit rester typed (`WebPage`) et basé sur Pinia (`storeToRefs`).
- TECH-004 : Aucun fallback `NuxtWelcome` ne doit subsister.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Mettre à jour `app/app.vue` pour wrapper avec `NuxtLayout` + `NuxtPage` et log.
- Créer le layout principal (`app/layouts/default.vue`) avec navigation localisée, switch de locale, toggle de thème, header/footer.
- Créer le layout contact dédié (`app/layouts/contact.vue`).
- Ajouter les pages `index`, `about`, `pocs`, `contact` (avec meta layout contact).
- Ajouter le composable `useWebPage` pour récupérer home par locale à partir du store.
- Relier la page d’accueil au composable et aux CTA localisés.

---

## 6. Tâches à réaliser

- [x] **T1 – App shell** : Adapter `app/app.vue` à `NuxtLayout`/`NuxtPage` + log.
- [x] **T2 – Layout principal** : Créer `app/layouts/default.vue` (nav locale, toggle thème, header/footer).
- [x] **T3 – Layout contact** : Créer `app/layouts/contact.vue` (nav simple + footer).
- [x] **T4 – Pages** : Créer `index.vue`, `about.vue`, `pocs.vue`, `contact.vue` (meta layout contact).
- [x] **T5 – Composable** : Implémenter `app/composables/useWebPage.ts` (Pinia + locale -> home).
- [ ] **T6 – Vérifs** : Contrôler routes localisées (`localePath`), CTA vers contact/POCs, chargement effectif des données home (store non chargé actuellement).

---

## 7. Notes / Risques

- RISK-001 : Données du store `webPage` absentes ou non chargées -> la home reste vide ; prévoir fallback texte.
- RISK-002 : Incohérence locale vs slug (ex : slug non trouvé) -> vérifier mapping `fr/en`.

> Formaliser une note de décision dédiée si un choix devient structurant ou critique.
