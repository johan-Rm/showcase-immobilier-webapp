# 🎯 Spec : POC – Long polling avec @nuxt/content

## 🔖 Métadonnées

- **ID** : SPEC-012
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade.
- **Objectif principal** : Lire `/content/products/*.md` via `queryContent()` du module `@nuxt/content` et rafraîchir périodiquement les données.

---

## 1. Description rapide

Mettre en place une page qui interroge `@nuxt/content` pour récupérer les produits (front matter + body) depuis `/content/products/*.md`, avec un polling régulier. Afficher la liste et refléter les mises à jour, tout en gérant les erreurs et l’arrêt du polling.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que visiteur, je vois la liste des produits depuis `@nuxt/content` et elle se rafraîchit périodiquement.
- **US2 (P2)** : En tant que dev, je peux configurer l’intervalle et déclencher un refresh manuel.
- **US3 (P2)** : En tant que dev, je vois les erreurs de chargement de contenu sans casser l’UI.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une page (ex. `/poc/long-polling-content`) affiche les produits issus de `queryContent('/products')`.
- **CA2** : Polling actif avec intervalle configurable et arrêt propre au unmounted.
- **CA3** : Gestion d’erreurs (fichier manquant, front matter invalide) avec message utilisateur et console clean.
- **CA4** : Bouton de refresh manuel en plus du polling automatique.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Le module `@nuxt/content` est installé et configuré.
- HYP-002 : Les fichiers `/content/products/*.md` sont présents et parsables.

### Contraintes techniques (TECH)

- TECH-001 : Utiliser `queryContent()` pour la récupération des produits.
- TECH-002 : Nettoyage des timers côté client, pas de fuite de polling.
- TECH-003 : Afficher un état de chargement/erreur clair.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Page `/poc/long-polling-content` utilisant `queryContent('/products')` dans un composable.
- Polling via setInterval ou `useIntervalFn`, configurable, stoppé au unmounted.
- UI : liste de produits, état loading/error, bouton “refresh”.
- Logs/alerte si content indisponible.

---

## 6. Tâches à réaliser

- [ ] **T1 – Data** : Vérifier présence de `/content/products/*.md` pour le POC.
- [ ] **T2 – Composable** : `useContentPolling` (queryContent + interval configurable + cleanup).
- [ ] **T3 – Page** : `/poc/long-polling-content` (liste, état, refresh manuel).
- [ ] **T4 – Erreurs** : Messages UI et logs contrôlés, pas d’erreurs console non gérées.
- [ ] **T5 – Vérifs** : Test polling + refresh manuel, arrêt au unmounted.

---

## 7. Notes / Risques

- RISK-001 : Polling trop fréquent -> charge inutile.
- RISK-002 : Fichiers MD invalides perturbant `queryContent` (prévoir skip).
- RISK-003 : Désalignement entre data `@nuxt/content` et data brute (voir POC FS).

> Formaliser une note de décision dédiée si la stratégie change (SWR, event source) ou si l’intervalle de polling devient une convention projet.
