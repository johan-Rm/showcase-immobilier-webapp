# 🎯 Spec : Design System – Fonts, Couleurs, Icônes & Thèmes (Tailwind + Nuxt UI + @nuxt/icon)

## 🔖 Métadonnées

- **ID** : SPEC-005
- **Statut** : En cours (socle livré, pas de tests automatisés)
- **Décisions structurantes** : À formaliser uniquement si un choix de design system ou d’architecture devient structurant.
- **Objectif principal** : Poser les tokens (fonts, couleurs light/dark), unifier les icônes et les variantes UI (boutons) via Tailwind, Nuxt UI et @nuxt/icon.

---

## 1. Description rapide

Tokens light/dark définis via variables CSS dans `app/assets/styles/theme.scss` (fonts du thème, palette, fond/texte/ring) et consommés par Tailwind. Nuxt UI est configuré (couleurs + variants boutons), styles utilitaires pour boutons dans `app/assets/styles/ui-button.scss`, et wrappers `BaseIcon` (@nuxt/icon) et `BaseButton` (UButton avec intents/variants). Toggle de thème exploite `colorMode` (config Nuxt) et classes utilitaires.

---

## 2. User Stories (essentielles)

Forme recommandée : _En tant que… Je veux… Afin de…_

- **US1 (Priorité P1)** : En tant que dev, je veux des tokens globaux (fonts, couleurs light/dark) pour garantir une identité visuelle cohérente.
- **US2 (Priorité P1)** : En tant que dev, je veux mapper ces tokens dans Tailwind et Nuxt UI afin de les utiliser simplement dans les composants.
- **US3 (Priorité P2)** : En tant que dev, je veux des composants socles (`BaseIcon`, `BaseButton`) pour uniformiser les icônes et les variantes de boutons (intents/variants).

---

## 3. Critères d’acceptation (succès)

- **CA1** : `app/assets/styles/theme.scss` expose les variables CSS (fonts, palette RGB, foreground/background) avec override `.dark` et applique la font/body + couleurs au `body`.
- **CA2** : `tailwind.config.ts` consomme ces tokens (`darkMode: 'class'`, fonts heading/body, couleurs via `rgb(var(--token) / <alpha-value>)`).
- **CA3** : `app.config.ts` définit les couleurs Nuxt UI (primary, secondary, danger, muted) et les variantes de boutons (solid/outline/ghost).
- **CA4** : `app/assets/styles/ui-button.scss` fournit les classes utilitaires pour les variantes de boutons et s’appuie sur les variables CSS.
- **CA5** : `app/components/BaseIcon.vue` (wrapper @nuxt/icon) gère les tailles `sm|md|lg` et applique `inline-block align-middle`.
- **CA6** : `app/components/BaseButton.vue` (wrapper `UButton`) expose `intent` (`primary|secondary|danger`) et `variant` (`solid|outline|ghost`) et associe les classes `.ui-btn*`.
- **CA7** : Check-list light/dark documentée pour le design system (états hover/focus, contrastes, icônes) même sans tests automatisés.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Tailwind, Nuxt UI et @nuxt/icon sont déjà installés/activés.
- HYP-002 : Le projet accepte des feuilles de styles globales dans `assets/styles`.

### Contraintes techniques (TECH)

- TECH-001 : Tokens centralisés dans `assets/styles/theme.css` (light/dark).
- TECH-002 : Tailwind lit les tokens (fonts, couleurs) via variables CSS.
- TECH-003 : Nuxt UI est configuré pour refléter les couleurs et variantes définies.
- TECH-004 : Icônes utilisées exclusivement via `BaseIcon`; boutons via `BaseButton`.

---

## 5. Plan d’implémentation (ultra-synthétique)

Décrire comment on s’y prend, sans entrer dans trop de détails.

- Créer/compléter `assets/styles/theme.css` (tokens fonts/couleurs, thème `.dark`, apply body).
- Mettre à jour `tailwind.config.ts` pour consommer les tokens (darkMode class, fonts, couleurs).
- Configurer `app.config.ts` pour les couleurs/variants Nuxt UI.
- Ajouter `assets/styles/ui-button.css` pour les variantes de boutons (solid/outline/ghost).
- Créer `BaseIcon.vue` (wrapper @nuxt/icon) et `BaseButton.vue` (wrapper UButton avec intent/variant).
- Tester en light/dark.

---

## 6. Tâches à réaliser

Format court, directement prêt pour ClickUp / GitHub Issues.

- [x] **T1 – Tokens** : Créer `assets/styles/theme.scss` (fonts, palette light/dark, body).
- [x] **T2 – Tailwind** : Mapper tokens dans `tailwind.config.ts` (darkMode class, fonts, couleurs).
- [x] **T3 – Nuxt UI** : Configurer `app.config.ts` (couleurs, variantes boutons).
- [x] **T4 – Styles boutons** : Créer `assets/styles/ui-button.scss` (variants solid/outline/ghost).
- [x] **T5 – BaseIcon** : Wrapper @nuxt/icon avec tailles `sm|md|lg`.
- [x] **T6 – BaseButton** : Wrapper UButton avec `intent`/`variant`.
- [ ] **T7 – Tests** : Vérifier rendu en light/dark et cohérence des couleurs.

---

## 7. Notes / Risques

- RISK-001 : Divergence si des composants contournent les wrappers (`<Icon>`, `UButton` natifs).
- RISK-002 : Conflits CSS si plusieurs sources définissent les mêmes classes de transition/couleur.
- RISK-003 : Manque d’alignement des tokens entre Tailwind et Nuxt UI (à tester en light/dark).

> Formaliser une note de décision dédiée si un choix devient structurant ou critique.
