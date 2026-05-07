# 🎯 Spec : Type Safety & DX

## 🔖 Métadonnées

- **ID** : SPEC-009
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si un choix de librairie ou de structure évolue.
- **Objectif principal** : Garantir une expérience dev typée de bout en bout (Volar/Vue, auto-imports, Nuxt types étendus) et instaurer Zod comme standard de validation runtime.

---

## 1. Description rapide

Étendre et sécuriser le typage Nuxt 4 : config Volar/Vue, auto-imports typés, extensions Nuxt (`nuxt.d.ts`) pour `RuntimeConfig`, `app.config` et modules (i18n, Pinia…), et adoption de Zod comme norme de validation runtime. Fournir un flux de référence schema Zod → type TS → usage composable → validation endpoint.

---

## 2. User Stories (essentielles)

Forme recommandée : _En tant que… Je veux… Afin de…_

- **US1 (Priorité P1)** : En tant que dev, je bénéficie d’une auto-complétion fiable (Volar) dans composants/composables/stores/services sans `any` implicite.
- **US2 (Priorité P1)** : En tant que dev, je dispose de types étendus Nuxt (RuntimeConfig, app.config, modules i18n/Pinia…) accessibles partout.
- **US3 (Priorité P1)** : En tant que dev, je peux définir un schema Zod, en dériver un type TS et l’utiliser dans un composable et un endpoint API pour valider les données.
- **US4 (Priorité P2)** : En tant qu’équipe, je dispose d’une doc courte expliquant comment ajouter un nouveau schema Zod, dériver ses types et l’utiliser côté front/API.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Volar/Vue types configurés (incl. `vue-tsc`/`tsconfig` refs) ; pas de `any` implicite dans les auto-imports composables.
- **CA2** : `nuxt.d.ts` (ou équivalent) étend `RuntimeConfig`, `app.config`, i18n, Pinia et les auto-imports composables/stores avec des types explicites.
- **CA3** : Zod installé et un dossier dédié (`shared/schemas` ou équivalent) héberge les schemas ; les types TS sont dérivés via `z.infer` et réexportés.
- **CA4** : Exemple complet livrable : un schema Zod réutilisé dans au moins un composable et un endpoint API, avec validation runtime (succès/erreur) et types partagés.
- **CA5** : Note interne (README ou section specs) décrivant la marche à suivre pour créer un schema, dériver son type et l’utiliser côté front et API.
- **CA6** : Aucune régression sur le strict TypeScript (respect constitution : pas de `any` non justifié).

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : TypeScript strict est déjà activé dans Nuxt (constitution).
- HYP-002 : Les auto-imports Nuxt/Pinia sont en place et peuvent être typés via déclaration globale.
- HYP-003 : Zod est acceptable côté client/serveur pour la validation runtime.

### Contraintes techniques (TECH)

- TECH-001 : Déclarations globales via `nuxt.d.ts` ou fichier `types/` reconnu par Nuxt (`types` dans `tsconfig`).
- TECH-002 : Types dérivés depuis Zod (`z.infer`) et réexportés (pas de duplication de modèles).
- TECH-003 : Composables auto-importés doivent exposer des signatures typées (pas de `any`).
- TECH-004 : Validation runtime obligatoire dans l’exemple endpoint (retour structuré en cas d’erreur).
- TECH-005 : Respect de la constitution (no `any`, strict TS, sécurité des données).

---

## 5. Plan d’implémentation (ultra-synthétique)

- Configurer Volar/tsconfig pour les types Vue/Nuxt et vérifier les auto-imports (composables/stores).
- Étendre `nuxt.d.ts` : `RuntimeConfig`, `app.config`, i18n, Pinia, auto-imports composables.
- Ajouter Zod et un dossier `shared/schemas` (ou équivalent) avec schemas + types dérivés.
- Fournir un exemple bout en bout : schema Zod → composable utilisant le type → endpoint API validant l’entrée/sortie.
- Rédiger une note interne (README/spec) sur la création/usage des schemas Zod.

---

## 6. Tâches à réaliser

- [ ] **T1 – Types Vue/Volar** : Configurer les types Vue/Nuxt (tsconfig/vue-tsc) et vérifier l’auto-complétion sans `any` implicite.
- [ ] **T2 – Déclarations globales** : Étendre `nuxt.d.ts` (RuntimeConfig, app.config, i18n, Pinia, auto-imports composables/stores).
- [ ] **T3 – Zod setup** : Installer Zod, créer `shared/schemas` (ou similaire), déclarer au moins un schema et dériver le type TS.
- [ ] **T4 – Exemple complet** : Réutiliser le schema dans un composable + un endpoint API avec validation runtime (succès/erreur structurée).
- [ ] **T5 – Documentation** : Rédiger une note (README/spec) sur la création/usage des schemas Zod et la dérivation des types.
- [ ] **T6 – Vérifs** : Contrôler absence de `any` non justifié, exécuter `vue-tsc`/type-check et valider l’exemple bout en bout.

---

## 7. Notes / Risques

- RISK-001 : Typage partiel des auto-imports pouvant masquer des `any` ; vérifier les d.ts générés.
- RISK-002 : Divergence entre schema Zod et types TS si les dérivations ne sont pas systématiques.
- RISK-003 : Poids bundle si Zod est utilisé naïvement côté client ; documenter l’usage ciblé et/ou limiter les imports.
- RISK-004 : Nécessité d’aligner les réponses d’erreur (structure normalisée) avec la constitution (sécurité/observabilité).

> Formaliser une note de décision dédiée si un choix structurant est retenu (ex. alternative à Zod ou organisation des schemas).
