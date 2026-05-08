# 🎯 Spec : POC – Nuxt MDC avec contenu FR

## 🔖 Métadonnées

- **ID** : SPEC-017
- **Statut** : En cours (module actif, rendu MDC deja utilise, perimetre POC a clarifier)
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si le choix d’architecture de contenu évolue.
- **Objectif principal** : Afficher des pages MDC en français depuis `content/fr` via le module Nuxt MDC.

---

## 1. Description rapide

Mettre en place un POC pour tester le module Nuxt MDC et rendre des fichiers `*.mdc` situés dans `content/fr`.
Le POC doit demontrer le rendu correct du contenu, l acces aux routes attendues et une configuration minimale.
Le but est de valider l’intégration du module sans dépendances inutiles.

Note d alignement :
le module `@nuxtjs/mdc` est deja actif dans `nuxt.config.ts` et un rendu MDC est deja consomme dans l UI.
La spec n est donc plus une intention purement future ; elle doit desormais cadrer le perimetre restant a verifier ou a formaliser.

---

## 2. User Stories (essentielles)

- **US1 (Priorité P1)** : En tant qu’utilisateur, je peux afficher une page MDC en français depuis `content/fr`.
- **US2 (Priorité P1)** : En tant que dev, je peux configurer le module MDC de manière minimale et documentée.
- **US3 (Priorité P2)** : En tant que dev, je peux ajouter un nouveau fichier `.mdc` et le voir apparaître sans config supplémentaire.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une page de démo rend un fichier `*.mdc` en FR depuis `content/fr`.
- **CA2** : La config du module `@nuxtjs/mdc` est présente et minimale.
- **CA3** : Les routes de contenu sont stables et documentées pour le POC.
- **CA4** : Aucune erreur console non gérée.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Les contenus FR existent déjà dans `content/fr`.
- HYP-002 : Le POC peut être client+SSR standard (pas de client-only).

### Contraintes techniques (TECH)

- TECH-001 : Utiliser le module `@nuxtjs/mdc` (pas d’alternative).
- TECH-002 : Pas de dépendance supplémentaire non justifiée.
- TECH-003 : Respecter la constitution : `.codex/constitution.md`.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Activer `@nuxtjs/mdc` dans `nuxt.config`.
- Créer une page POC (ex. `/poc/mdc`) qui rend un fichier `.mdc` de `content/fr`.
- Définir une stratégie simple pour le mapping route -> fichier.
- Documenter le POC et comment ajouter un nouveau fichier MDC.

---

## 6. Tâches à réaliser

- [ ] **T1 – Setup** : Installer/activer `@nuxtjs/mdc` et config minimale.
- [ ] **T2 – Contenu** : Identifier un fichier `content/fr/*.mdc` de référence.
- [ ] **T3 – Page POC** : Afficher le contenu MDC via une route dédiée.
- [ ] **T4 – Vérifs** : Tester rendu SSR + absence d’erreurs console.
- [ ] **T5 – Documentation** : Expliquer comment ajouter un `.mdc` FR et l’exposer.

---

## 7. Notes / Risques

- RISK-001 : Incohérence entre structure `content/fr` et mapping de routes.
- RISK-002 : Régression de rendu si la config MDC est incomplète.

> Formaliser une note de décision dédiée si un choix devient structurant ou critique.
