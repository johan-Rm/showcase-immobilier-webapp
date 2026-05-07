# 🎯 Spec : Transitions globales (pages & layouts) Nuxt 4

## 🔖 Métadonnées

- **ID** : SPEC-008
- **Statut** : En cours (transitions globales actives, pas d’override/documentation)
- **Décisions structurantes** : À formaliser uniquement si un choix de transitions ou d’architecture devient structurant.
- **Objectif principal** : Centraliser et standardiser les transitions pages/layouts dans la configuration Nuxt et une feuille de styles dédiée pour une UX cohérente.

---

## 1. Description rapide

Transitions Nuxt 4 globales déclarées dans `nuxt.config.ts` (`app.pageTransition`, `app.layoutTransition`) et animées via `app/assets/transitions.scss` (fade + légers déplacements). Aucune surcharge locale n’est encore définie ; seules les transitions globales s’appliquent.

---

## 2. User Stories (essentielles)

Forme recommandée : _En tant que… Je veux… Afin de…_

- **US1 (Priorité P1)** : En tant que dev, je veux définir des transitions globales pour les pages/layouts dans `app.config.ts` afin d’assurer une cohérence UX par défaut.
- **US2 (Priorité P1)** : En tant que dev, je veux centraliser les animations CSS des transitions dans `assets/css/transitions.css` pour les maintenir facilement.
- **US3 (Priorité P2)** : En tant que dev, je veux pouvoir surcharger ponctuellement les transitions sur certaines pages ou layouts pour répondre à des besoins spécifiques (ex : espace public vs dashboard).

---

## 3. Critères d’acceptation (succès)

- **CA1** : `nuxt.config.ts` configure `app.pageTransition` et `app.layoutTransition` avec `name: 'page'/'layout'` et `mode: 'out-in'`.
- **CA2** : `app/assets/transitions.scss` fournit les classes associées (fondu + translation verticale pour pages, translation horizontale pour layouts) et est importé dans `nuxt.config.ts`.
- **CA3** : Documentation sur les overrides de transitions (page/layout) disponible avec un exemple `definePageMeta` et rappel d’import SCSS (cf. `app/assets/README.md`).
- **CA4 (optionnel)** : Layering/documentation multi-layer non rédigés à ce stade.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Nuxt 4 est déjà configuré avec `app.config.ts` chargé globalement.
- HYP-002 : Le projet accepte un fichier CSS/SCSS global pour les transitions.

### Contraintes techniques (TECH)

- TECH-001 : Les transitions globales sont définies dans `app.config.ts` (pas dans `nuxt.config.ts`).
- TECH-002 : Les animations associées sont regroupées dans `assets/css/transitions.css`.
- TECH-003 : Les overrides locaux utilisent les APIs Nuxt (`definePageMeta`, metadata de layout) sans casser la config globale.

---

## 5. Plan d’implémentation (ultra-synthétique)

Décrire comment on s’y prend, sans entrer dans trop de détails.

- Ajouter/mettre à jour `app.config.ts` avec `pageTransition` et `layoutTransition` (`name`, `mode`).
- Créer/mettre à jour `assets/css/transitions.css` avec les animations par défaut (ex. fade, slide horizontal).
- Documenter l’emplacement (layers core/ui si présent) et l’usage des overrides (page/layout).
- Vérifier que Nuxt charge le CSS global et que les classes générées correspondent (`page-*`, `layout-*`).

---

## 6. Tâches à réaliser

Format court, directement prêt pour ClickUp / GitHub Issues.

- [x] **T1 – Config globale** : Définir `pageTransition` et `layoutTransition` (name + mode) dans la config Nuxt.
- [x] **T2 – Styles** : Ajouter les animations par défaut dans `app/assets/transitions.scss` (fade + slide).
- [x] **T3 – Overrides** : Documenter/illustrer les overrides possibles dans pages/layouts (ex. `definePageMeta`).
- [ ] **T4 – Layers (optionnel)** : Documenter la répartition `layers/core` vs `layers/ui` si l’architecture multi-layer est utilisée.
- [ ] **T5 – Vérifs** : Contrôler le chargement des classes Nuxt, le rendu des transitions et l’absence de régression.

---

## 7. Notes / Risques

- RISK-001 : Incohérence si certaines pages/layouts définissent leurs propres transitions sans respecter les conventions de nommage.
- RISK-002 : CSS non chargé ou conflit de priorités si plusieurs fichiers définissent les mêmes classes de transition.
- RISK-003 : Dans une architecture multi-layer, bien documenter où vivent la config et les styles pour éviter la duplication.

> Formaliser une note de décision dédiée si un choix devient structurant ou critique.
