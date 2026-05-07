# 🎯 Spec : Page de référence – tous les composants gratuits Nuxt UI (avec exemples)

## 🔖 Métadonnées

- **ID** : SPEC-010
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade.
- **Objectif principal** : Disposer d’une page interne unique listant tous les composants gratuits de `@nuxt/ui`, chacun avec un exemple minimal “copiable” et fonctionnel, sans impacter l’existant.

---

## 1. Description rapide

Ajouter une page dédiée “Nuxt UI Showcase” accessible via une URL directe (sans modification de la navigation existante) qui expose l’intégralité des composants gratuits de `@nuxt/ui` installés dans le projet. Chaque composant doit être présenté avec un rendu live et un snippet de code simple et exploitable (props/slots basiques), afin de servir de référence interne rapide et maintenable.

---

## 2. User Stories (essentielles)

- **US1 (Priorité P1)** : En tant que dev, je veux une page interne listant tous les composants `@nuxt/ui` pour retrouver rapidement quoi utiliser et comment.
- **US2 (Priorité P1)** : En tant que dev, je veux un exemple minimal par composant (rendu + snippet copiable) pour pouvoir réutiliser immédiatement.
- **US3 (Priorité P2)** : En tant que dev, je veux pouvoir filtrer/rechercher par nom de composant et naviguer par catégories pour gagner du temps.
- **US4 (Priorité P2)** : En tant que mainteneur, je veux une implémentation isolée (dossier dédié + registry) qui minimise les impacts et facilite les mises à jour Nuxt UI.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une nouvelle page dédiée existe (route explicite, ex. `/internal/nuxt-ui`) sans ajout de lien dans la navigation/layouts existants.
- **CA2** : La page affiche **tous** les composants gratuits `@nuxt/ui` présents dans le projet (inventaire aligné sur la version installée).
- **CA3** : Chaque composant a au minimum :
  - un rendu live visible,
  - un snippet de code court correspondant,
  - un bouton “copier” (clipboard) pour le snippet.
- **CA4** : La page permet de filtrer par texte (nom) et, si possible, par catégorie (Forms, Layout, Data, Feedback, Navigation…).
- **CA5** : L’implémentation est isolée (ex. `app/pages/internal/nuxt-ui.vue` + `app/components/nuxt-ui-showcase/*` + un registry dédié) et n’introduit pas de régressions sur les pages existantes.
- **CA6** : La page est clairement identifiée comme interne (dev-only ou désactivable en prod via variable/flag), et n’est pas indexée (robots/noindex ou routeRules).

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : `@nuxt/ui` est déjà installé et configuré (ce repo utilise `@nuxt/ui@^4.2.1`).
- HYP-002 : Les composants Nuxt UI sont auto-importés et utilisables dans une page Nuxt standard.
- HYP-003 : Une page interne peut être accessible uniquement via URL directe (pas besoin d’ajouter une entrée de menu).

### Contraintes techniques (TECH)

- TECH-001 : L’implémentation doit être **isolée** (aucune modification nécessaire de l’existant hors ajout de fichiers).
- TECH-002 : La page doit rester **maintenable** : éviter un monolithe (préférer un registry + sous-composants).
- TECH-003 : Pas de dépendances externes supplémentaires nécessaires pour cette spec (s’appuyer sur Nuxt/Vue et `@nuxt/ui`).
- TECH-004 : Le listing “tous les composants gratuits” doit être déterministe (aligné sur la version installée) et facilement actualisable lors d’un bump de `@nuxt/ui`.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Créer une page dédiée (ex. `app/pages/internal/nuxt-ui.vue`) avec un layout minimal (header, recherche, sections).
- Introduire un **registry** (ex. `app/nuxt-ui-showcase/registry.ts`) qui liste les composants à afficher et associe :
  - un nom/catégorie,
  - un composant “demo” (Vue) rendu dans la page,
  - un snippet (string) affiché et copiable.
- Créer un composant de présentation commun (ex. `NuxtUiShowcaseCard.vue`) pour standardiser : titre, preview, snippet, actions.
- Ajouter une recherche (input) + filtres par catégorie.
- Ajouter un mécanisme “interne only” :
  - soit par `routeRules` (noindex) + flag `runtimeConfig.public`,
  - soit par middleware simple (rediriger/404 si flag désactivé).
- Ajouter une check-list de mise à jour (comment régénérer/mettre à jour l’inventaire lors des upgrades `@nuxt/ui`).

---

## 6. Tâches à réaliser

- [ ] **T1 – Route interne** : Créer la page `app/pages/internal/nuxt-ui.vue` (route non reliée à la nav existante).
- [ ] **T2 – Garde interne** : Ajouter un flag (runtimeConfig) + noindex/routeRules et bloquer la page en prod si désactivée.
- [ ] **T3 – UI de base** : Ajouter recherche + filtres + sections + structure responsive (liste de cards).
- [ ] **T4 – Showcase shell** : Créer un composant de card “preview + code + copy”.
- [ ] **T5 – Registry** : Mettre en place le registry (nom/catégorie/demo/snippet) et un tri stable.
- [ ] **T6 – Demos (Core)** : Ajouter les démos pour les composants fondamentaux (forms/navigation/feedback) et valider le pattern.
- [ ] **T7 – Demos (Exhaustif)** : Ajouter les démos restantes pour couvrir 100% de l’inventaire `@nuxt/ui` de la version installée.
- [ ] **T8 – Vérifs** : Vérifier rendu, accessibilité basique (focus, keyboard), performances (pagination/collapsible si nécessaire).
- [ ] **T9 – Doc interne** : Documenter dans `specs/090-reference-composants-nuxt-ui.md` la procédure de mise à jour quand `@nuxt/ui` change.

---

## 7. Notes / Risques

- RISK-001 : “Tous les composants” est volumineux -> prévoir une UX qui évite un scroll infini (collapsible, pagination, lazy render).
- RISK-002 : Certains composants nécessitent du contexte (providers, slots, données) -> définir un “minimal viable demo” par catégorie.
- RISK-003 : La liste de composants évolue selon la version `@nuxt/ui` -> prévoir un inventaire stable + checklist de mise à jour.
- RISK-004 : Exposer cette page en production peut être non désiré -> la protéger via flag/middleware + noindex.

---

## Annexe A — Inventaire `@nuxt/ui` (observé dans ce repo)

Source : `node_modules/@nuxt/ui/dist/runtime/components` (version `@nuxt/ui@^4.2.1`).

```
Accordion
Alert
App
AuthForm
Avatar
AvatarGroup
Badge
Banner
BlogPost
BlogPosts
Breadcrumb
Button
Calendar
Card
Carousel
ChangelogVersion
ChangelogVersions
ChatMessage
ChatMessages
ChatPalette
ChatPrompt
ChatPromptSubmit
Checkbox
CheckboxGroup
Chip
Collapsible
ColorPicker
CommandPalette
Container
ContextMenu
ContextMenuContent
DashboardGroup
DashboardNavbar
DashboardPanel
DashboardResizeHandle
DashboardSearch
DashboardSearchButton
DashboardSidebar
DashboardSidebarCollapse
DashboardSidebarToggle
DashboardToolbar
Drawer
DropdownMenu
DropdownMenuContent
Empty
Error
FieldGroup
FileUpload
Footer
FooterColumns
Form
FormField
Header
Icon
Input
InputDate
InputMenu
InputNumber
InputTags
InputTime
Kbd
Link
LinkBase
Main
Marquee
Modal
NavigationMenu
OverlayProvider
Page
PageAnchors
PageAside
PageBody
PageCTA
PageCard
PageColumns
PageFeature
PageGrid
PageHeader
PageHero
PageLinks
PageList
PageLogos
PageSection
Pagination
PinInput
Popover
PricingPlan
PricingPlans
PricingTable
Progress
RadioGroup
Select
SelectMenu
Separator
Skeleton
Slideover
Slider
Stepper
Switch
Table
Tabs
Textarea
Timeline
Toast
Toaster
Tooltip
Tree
User
```
