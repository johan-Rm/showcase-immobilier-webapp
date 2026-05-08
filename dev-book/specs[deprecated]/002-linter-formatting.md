# 🎯 Spec : Linter & Formatting (ESLint / Prettier)

## 🔖 Métadonnées

- **ID** : SPEC-002
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si des règles dérogent aux conventions Nuxt ou TypeScript.
- **Objectif principal** : Garantir un code Nuxt homogène, lisible et corrigible automatiquement via ESLint + Prettier.

---

## 1. Description rapide

Mettre en place un socle de lint/format adapté à Nuxt (Vue + TypeScript strict) afin d’attraper tôt les écarts de style ou d’usage, d’appliquer un formatage stable (Prettier + plugin Tailwind) et de fournir des commandes Bun pour vérifier et corriger automatiquement le code.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que dev, je peux lancer un lint Nuxt/TS/Vue qui bloque les erreurs et signale les imports ou règles incohérentes.
- **US2 (P1)** : En tant que dev, je peux formater tout le projet avec Prettier (incl. tri des classes Tailwind) pour un style uniforme.
- **US3 (P2)** : En tant que dev, je dispose de commandes Bun (`lint`, `lint:fix`, `format`, `format:check`) pour automatiser ces contrôles localement ou en CI.

---

## 3. Critères d’acceptation (succès)

- **CA1** : ESLint est configuré pour Nuxt/Vue + TypeScript strict, inclut `import/order` et nettoyage des imports inutiles.
- **CA2** : Prettier est configuré avec le plugin Tailwind ; les fichiers générés/artefacts sont ignorés (.nuxt, dist, coverage, etc.).
- **CA3** : Scripts Bun disponibles : `bun run lint`, `bun run lint:fix`, `bun run format`, `bun run format:check`.
- **CA4** : EditorConfig présent pour harmoniser indentation/EOL.
- **CA5** : Documentation courte dans `README.md` expliquant commandes et périmètre du lint/format.
- **CA6** : Les règles interdisent `any` non justifié et limitent `console` en production (sauf warn/error).

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Bun est disponible (>= 1.2).
- HYP-002 : Le projet cible tourne sous Nuxt avec TypeScript strict.
- HYP-003 : Les développeurs utilisent un IDE compatible EditorConfig.

### Contraintes techniques (TECH)

- TECH-001 : S’appuyer sur `eslint-plugin-nuxt` et `eslint-plugin-vue` compatibles Vue/Nuxt.
- TECH-002 : Utiliser `@typescript-eslint` pour le parser/règles TS et `eslint-plugin-unused-imports` pour le nettoyage.
- TECH-003 : Prettier 3+ avec `prettier-plugin-tailwindcss` pour ordonner les classes.
- TECH-004 : Aliases `@/` et `~/` doivent être résolus par ESLint (import/resolver alias/TS).
- TECH-005 : Scripts exécutés via Bun (pas de npm/yarn par défaut).

---

## 5. Plan d’implémentation (ultra-synthétique)

- Ajouter les dépendances dev ESLint/Prettier nécessaires (Nuxt, Vue, TS, import/order, unused-imports, Tailwind plugin).
- Créer la config ESLint (root) couvrant .ts/.vue, parser TS, règles d’imports, interdiction de `any`, Prettier en mode error.
- Créer la config Prettier + ignore ; ajouter .editorconfig et .eslintignore.
- Déclarer les scripts Bun lint/format.
- Mettre à jour la doc README (section Quality) et, si présent, un fichier CI pour lancer lint/format.
- Vérifier que les aliases TS sont pris en compte (paths + resolver).

---

## 6. Tâches à réaliser

- [ ] **T1 – Déps tooling** : Ajouter devDeps ESLint/Prettier (Nuxt, Vue, TS, import/order, unused-imports, prettier-plugin-tailwindcss).
- [ ] **T2 – Config ESLint** : `.eslintrc` (parser Vue+TS, règles Nuxt, import/order, no-any, unused imports, Prettier).
- [ ] **T3 – Config Prettier** : `prettier.config.*` + `.prettierignore` (builds, .nuxt, dist, coverage, docs).
- [ ] **T4 – Scripts Bun** : `lint`, `lint:fix`, `format`, `format:check` dans `package.json`.
- [ ] **T5 – Cohérence éditeur** : `.editorconfig` + `.eslintignore`.
- [ ] **T6 – Docs/CI** : Mise à jour `README.md` (commandes) et ajout du lint/format dans la CI si existante.
- [ ] **T7 – Vérifs** : Exécuter lint/format:check sur un échantillon pour valider les règles et l’intégration des aliases.

---

## 7. Notes / Risques

- RISK-001 : Versions de plugins Nuxt/Vue/TS doivent rester alignées sur la version de Nuxt utilisée (ruptures possibles).
- RISK-002 : Règles strictes (`no-explicit-any`, import/order) peuvent nécessiter des adaptations sur du code legacy ; prévoir itération progressive si besoin.
- RISK-003 : Les plugins Tailwind/Prettier peuvent être sensibles à la version de Tailwind ; vérifier compatibilité en cas de mise à jour majeure.

> Formaliser une note de décision dédiée si des règles dérogent à la constitution (ex. autoriser `console.log` ou `any` temporairement).
