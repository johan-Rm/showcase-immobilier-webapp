# 🎯 Spec : POC – Fiche produit horizontale animée

## 🔖 Métadonnées

- **ID** : SPEC-014
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si le choix d’outils d’animation évolue.
- **Objectif principal** : Présenter une fiche produit immobilière en scroll horizontal avec cinématique (GSAP/ScrollTrigger) et fallback compatible mobile.

---

## 1. Description rapide

Créer une page de démonstration qui affiche une fiche produit de bien immobilier en layout horizontal, avec sections animées au scroll (pinning, transitions). Utiliser GSAP + ScrollTrigger si possible, avec un fallback fluide sans JS critique sur mobile.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que visiteur, je vois une fiche produit horizontale avec sections épinglées et animations fluides au scroll.
- **US2 (P1)** : En tant que visiteur mobile, je dispose d’un fallback vertical lisible si l’effet horizontal n’est pas supporté.
- **US3 (P2)** : En tant que dev, je peux configurer les points d’ancrage/animations via des données de produit sans modifier le code core.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une page dédiée (ex. `/poc/product-sheet`) affiche un produit avec au moins 4 sections (hero, détails clés, médias, contact).
- **CA2** : Les animations GSAP/ScrollTrigger sont actives sur desktop (pinning, transitions) et désactivées proprement si GSAP indisponible.
- **CA3** : Fallback vertical fonctionnel et lisible sur mobile (pas de blocage du scroll natif).
- **CA4** : Données de la fiche issues d’un fichier de contenu (YAML/MD) ou d’un mock JSON unique pour le POC.
- **CA5** : Aucune erreur console en navigation/resize.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : GSAP + ScrollTrigger disponibles (ou ajoutés en devDependency).
- HYP-002 : Une source de données produit existe (mock local ou fichier MD/YAML).

### Contraintes techniques (TECH)

- TECH-001 : Respecter le layout horizontal sur desktop, fallback vertical mobile.
- TECH-002 : Animations découplées des données (data -> view).
- TECH-003 : Gestion du resize/détachement pour éviter les fuites GSAP.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Page `/poc/product-sheet.vue` avec sections composables et data injectée.
- Loader de données depuis `content/products/*.md` ou `data/product.json` (mock).
- Hook/composable GSAP (init ScrollTrigger, cleanup on unmounted/resize).
- Styles responsives : horizontal desktop (overflow-x hidden, sections 100vw), vertical mobile (media query).
- Logs ou badge UI pour indiquer mode animé vs fallback.

---

## 6. Tâches à réaliser

- [ ] **T1 – Data** : Préparer un mock produit (MD/YAML ou JSON) avec sections hero/détails/médias/contact.
- [ ] **T2 – Vue** : Créer la page `/poc/product-sheet` avec layout horizontal + fallback vertical.
- [ ] **T3 – Animations** : Intégrer GSAP/ScrollTrigger (pinning, transitions, cleanup).
- [ ] **T4 – Responsive/Tests** : Vérifier mobile/desktop, erreurs console, fallback sans GSAP.
- [ ] **T5 – Doc** : Noter les limitations et dépendances (GSAP) ; formaliser une note dédiée si le choix d’outil change.

---

## 7. Notes / Risques

- RISK-001 : Performance/scroll jank si animations non optimisées.
- RISK-002 : Dégradation mobile si le fallback n’est pas correctement isolé.
- RISK-003 : Couplage fort data/animation à éviter (prévoir structure de sections).

> Formaliser une note de décision dédiée si un autre moteur d’animation est choisi ou si le fallback diffère des conventions UI.
