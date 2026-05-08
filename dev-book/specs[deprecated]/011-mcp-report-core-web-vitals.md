# 🎯 Spec : MCP `report-core-web-vitals()` — Rapport Core Web Vitals (global + par route)

## 🔖 Métadonnées

- **ID** : SPEC-011
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si le choix de stockage ou de format devient structurant.
- **Objectif principal** : Produire un rapport Core Web Vitals agrégé (global + top routes), exploitable par un humain et par ChatGPT, sans PII.

---

## 1. Description rapide

Exposer un outil MCP `report-core-web-vitals()` qui génère un rapport Core Web Vitals à partir de sources disponibles (Field/RUM `web-vitals`, Lab Lighthouse, signaux serveur Nitro/TTFB), au format JSON structuré et directement exploitable. Le rapport doit fournir un statut global, des métriques agrégées (p75/p95 selon dispo), une vue “par route” (top N problématiques), des signaux techniques probables, et des recommandations priorisées (impact/effort/priorité).

Contrainte centrale : **aucune donnée utilisateur brute** et **agrégation uniquement** ; l’outil est **lecture seule** par défaut.

---

## 2. User Stories (essentielles)

Forme recommandée : _En tant que… Je veux… Afin de…_

- **US1 (Priorité P1)** : En tant que dev/ops, je veux un rapport CWV global (LCP/CLS/INP [+ TTFB si dispo]) avec statuts (good/needs-improvement/poor) afin de prioriser les chantiers de performance.
- **US2 (Priorité P1)** : En tant que dev, je veux un classement des routes les plus problématiques (top N) avec métriques et signaux afin d’attaquer les pages qui pèsent le plus.
- **US3 (Priorité P1)** : En tant que dev, je veux filtrer le rapport par période, route, device et source (field/lab/both) afin de confirmer une hypothèse (ex. mobile/INP).
- **US4 (Priorité P2)** : En tant que PM/tech lead, je veux des recommandations structurées (priorité, impact attendu, effort) afin de créer rapidement des tickets.

---

## 3. Critères d’acceptation (succès)

- **CA1** : L’outil MCP `report-core-web-vitals()` accepte les inputs :
  - `period`: `"24h" | "7d" | "28d"` (défaut `"7d"`)
  - `route`: `string | "all"` (défaut `"all"`)
  - `device`: `"mobile" | "desktop" | "all"` (défaut `"all"`)
  - `source`: `"field" | "lab" | "both"` (défaut `"field"`)
- **CA2** : Le résultat contient au minimum : `summary`, `metrics`, `byRoute`, `signals`, `recommendations` (et `rawRefs` optionnel).
- **CA3** : Les métriques incluent LCP/CLS/INP (et TTFB si disponible) avec une valeur agrégée (p75 par défaut ; p95 si disponible) + un `status` par métrique.
- **CA4** : `byRoute` retourne un **top N** (ex. N=10) des routes “problématiques” (tri explicite) avec métriques et signaux associés, sans query params sensibles.
- **CA5** : `signals` ne contient que des indices techniques non-PII (ex. images LCP, JS long tasks, hydratation, fonts, cache/cdn, SSR/TTFB).
- **CA6** : `recommendations` est une liste d’actions priorisées (P1/P2/P3) avec `expectedImpact` (LCP/CLS/INP/TTFB) et `effort` (S/M/L).
- **CA7** : Aucune donnée brute utilisateur n’est retournée (pas d’IP, pas d’ID, pas de user-agent complet, pas de traces non agrégées).
- **CA8** : L’outil est lecture seule : aucune écriture disque par défaut (hors logs applicatifs standards).

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Des sources agrégées existent ou sont fournies (exports Lighthouse JSON, agrégats RUM, logs/timings Nitro) et sont accessibles en lecture.
- HYP-002 : Les routes peuvent être normalisées (path-only) et comparées sans inclure de query params.
- HYP-003 : Les statuts (good/needs-improvement/poor) suivent les seuils Web Vitals publics (ou une table de seuils interne stable et documentée).

### Contraintes techniques (TECH)

- TECH-001 : **Aucune PII** : jamais de données utilisateur brutes, jamais d’identifiants, jamais de query params sensibles dans les clés/exports.
- TECH-002 : **Agrégation uniquement** : p75/p95, moyenne, volume (n) — pas d’échantillons individuels.
- TECH-003 : **Lecture seule par défaut** : l’outil ne collecte pas et n’écrit pas ; l’ingestion/collecte/agrégation (RUM endpoint, LHCI runs) doit être gérée par une tâche/outillage séparé.
- TECH-004 : Le résultat est stable et “machine-friendly” (JSON), sans verbiage, et exploitable tel quel par ChatGPT.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Définir un schéma de données interne (types) pour :
  - métriques agrégées (p75/p95/avg/n, status),
  - filtres (period/route/device/source),
  - sorties (`summary`, `metrics`, `byRoute`, `signals`, `recommendations`, `rawRefs?`).
- Implémenter un résolveur unique qui :
  - lit des agrégats “field” et/ou “lab” depuis des emplacements configurés (runtimeConfig),
  - normalise les routes (path-only, suppression query/hash),
  - calcule statuts + classements (top N) et compose les signaux.
- Optionnel : brancher TTFB via agrégats Nitro (cache hit/miss, timings SSR) si disponibles, sinon omettre proprement la métrique.
- Retourner un JSON strictement agrégé + pointeurs `rawRefs` vers des fichiers/exports autorisés (chemins internes, pas de contenu brut).

---

## 6. Tâches à réaliser

- [ ] **T1 – Contrat tool** : Définir inputs/défauts + schéma de sortie (types + exemple minimal).
- [ ] **T2 – Normalisation routes** : Standardiser `route` (path-only) et règles d’exclusion des query params sensibles.
- [ ] **T3 – Lecture sources** : Implémenter lecteurs “field” / “lab” (et “both”) avec configuration d’emplacement en lecture.
- [ ] **T4 – Agrégation & statuts** : Calculer p75/p95 (si dispo), statuts good/needs-improvement/poor, et cohérence global vs par route.
- [ ] **T5 – Classement top N** : Définir la logique de tri “routes problématiques” (ex. pire statut puis volume puis LCP/INP).
- [ ] **T6 – Signaux** : Produire une liste d’indices techniques déduits (images, JS, hydratation, cache, fonts, SSR/TTFB).
- [ ] **T7 – Recos** : Générer des recommandations structurées (priority/expectedImpact/effort) basées sur métriques + signaux.
- [ ] **T8 – Garde-fous PII** : Ajouter validations/redactions (routes, champs) + tests/fixtures garantissant l’absence de données brutes.
- [ ] **T9 – Doc** : Documenter les formats d’inputs, de sortie, et la procédure pour brancher des sources (sans écrire depuis l’outil).

---

## 7. Notes / Risques

- RISK-001 : Données sources hétérogènes (field vs lab) → définir une stratégie d’unification (priorité, labels, comparabilité).
- RISK-002 : Routes dynamiques (ex. `/product/[id]`) → prévoir une normalisation (patterning) sinon `byRoute` devient bruyant.
- RISK-003 : PII involontaire via query params → appliquer une normalisation stricte et une allowlist de paramètres non sensibles (idéalement aucun).
- RISK-004 : Recommandations trop génériques → lister des signaux concrets et lier chaque reco à un “pourquoi” (métrique + indice).
