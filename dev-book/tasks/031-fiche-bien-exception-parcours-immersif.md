---
status: Fait
dependances: []
---

# 031 — Fiche bien d'exception : intégration du parcours immersif horizontal

> **Pour les agents:** Utiliser `superpowers:subagent-driven-development` ou
> `superpowers:executing-plans` pour exécuter ce plan tâche par tâche.
>
> **Réalisé (commits `bfa18e1` + `0dec781`)** : décomposition complète livrée et vérifiée en
> runtime sur `/properties/bien-a-vendre/villa-golf/villa-des-alizes`.
>
> - `services/mapper/exceptional.ts` (+ `shared/types/exceptional.ts`) + 14 tests
>   (`exceptional.vitest.ts`) ; garde `isExceptionalProperty`.
> - 7 composants `components/property/Exceptional*.vue` + `exceptional.helpers.ts`,
>   surcouches `ExceptionalSummary` / `ExceptionalInfoPanel` / `ExceptionalLightbox`.
> - `composables/useExceptionalRail.ts` (rail, molette→horizontal, clavier, mode lecture,
>   autoplay carousel, lightbox, handoff `next-screen`, neutralisation hors écran actif).
> - `components/screen/PropertyExceptional.vue` (capture `navigator.enabled:false`, patron
>   `ScreenPropertyList`) ; page `[accommodationSlug]` : garde + fallback + `@next-screen="next"`.
> - i18n : « Référence » + « Demander une visite » via `accommodationUi` (aria en dur, comme
>   l'existant).
>
> **Aria-labels non externalisés** (FR en dur, cohérent avec `ScreenPropertyDetail`).

**Goal:** Faire passer la fiche d'un bien d'exception du carrousel vertical classique
(`ScreenPropertyDetail`) à un **parcours immersif horizontal** content-driven, dérivé des
blocs `hasPart` du bien. Le parcours s'active **conditionnellement** (repli sur la fiche
actuelle si le bien n'a pas de parcours valide) et devient le **premier écran vertical** de
la page, suivi de la relance 3 colonnes et du footer existants.

**Architecture:** Le POC monolithique `app/pages/villa-des-alizes-content.vue` (référence
figée, à ne pas modifier) est **décomposé** conformément aux standards `docs/2.architecture/` :

- la dérivation `hasPart → screens` part dans un **mapper view-model dédié** en `services/`
  (framework-agnostic), sur le même patron que `services/mapper/webPage.ts` ;
- chaque layout de screen devient un composant d'affichage pur dans `app/components/property/` ;
- la logique du rail (wheel, clavier, mode lecture, lightbox, autoplay, écran actif) part en
  composable ;
- un orchestrateur `ScreenPropertyExceptional` monte le rail et les surcouches ;
- la page choisit parcours immersif **ou** fiche classique selon une garde.

> **Pourquoi un mapper dédié et pas `services/mapper/accommodation.ts` ?** `accommodation.ts`
> est le mapper **d'ingestion** (DTO brut → modèle de domaine `Accommodation`), partagé par
> toutes les pages. Il fait `...item` (l. 391) : `hasPart` **traverse** donc le mapper et
> arrive au store tel quel, sans transformation. La transformation `hasPart → view-model de
screens` (résolution `additionalType`→layout, `parseHeadline`, badges, ids, template de
> repli) est une **logique de présentation** propre au parcours : la mettre dans le mapper
> d'ingestion le couplerait à une seule feature UI (SRP/SoC). Le mapper dédié `exceptional.ts`
> consomme `accommodation.hasPart` et produit `ExceptionalScreen[]`.

**Coexistence des navigations (point dur) — patron éprouvé `ScreenPropertyList`.** Le projet
résout déjà ce cas : `app/components/screen/PropertyList.vue` est un rail horizontal embarqué
dans le même `useScreenSystem` vertical, sur la page `properties/[realEstateListing]/index.vue`
(structure **identique** à notre cible : rail → relance → footer). Patron à répliquer :

1. **Capture totale** : au montage, l'écran pose
   `setScreenMeta('screen-property-detail', { navigator: { enabled: false }, … })`
   (cf. `PropertyList.vue:510`) → la navigation verticale du système est désactivée tant que
   l'écran parcours est actif.
2. **Listeners propres** : l'écran attache ses propres `wheel`/`keydown`/`touch` (déjà le cas
   dans le POC) avec lock molette et garde d'animation pour avancer dans le rail horizontal.
3. **Handoff explicite** : pour passer à la relance (écran vertical suivant), l'écran **émet**
   `next-screen` ; la page câble `@next-screen="next"` (`next` issu de `useScreenSystem`, cf.
   `properties/[realEstateListing]/index.vue:12`). Il ne réactive **jamais** `navigator`. Le
   retour relance → parcours est géré nativement par le système (l'écran relance a sa nav active).

Le rail se terminant sur l'écran Contact interne, l'émission de `next-screen` est déclenchée par
une **affordance explicite** en fin de rail (indicateur « continuer » / chevron bas sur l'écran
Contact), comme `PropertyOverlayGridList` le fait pour la liste — plus robuste qu'une détection
de geste en butée.

**Décisions de cadrage :**

- périmètre : **conditionnel + fallback** (pas de remplacement total, pas de route dédiée) ;
- structure : **décomposition complète** (conforme aux standards) ;
- sections verticales : **parcours + relance + footer** conservés ;
- fin du rail : **écran Contact interne conservé** (`FormContactProperty`), doublon avec le
  footer assumé ; le CTA « Demander une visite » du drawer pointe vers cet écran ;
- nommage : racine **`Exceptional`** partout (composants, composable, mapper, types, garde).

**Tech Stack:** Nuxt 4, Vue 3, TypeScript strict, Pinia, Nuxt UI v4, @nuxt/image.

---

## Fichiers impactés

| Fichier                                                                                    | Action   |
| ------------------------------------------------------------------------------------------ | -------- |
| `services/mapper/exceptional.ts`                                                           | Créer    |
| `services/mapper/exceptional.test.ts`                                                      | Créer    |
| `shared/types/exceptional.ts`                                                              | Créer    |
| `app/components/property/ExceptionalFull.vue`                                              | Créer    |
| `app/components/property/ExceptionalOverlay.vue`                                           | Créer    |
| `app/components/property/ExceptionalSplit.vue`                                             | Créer    |
| `app/components/property/ExceptionalTriptych.vue`                                          | Créer    |
| `app/components/property/ExceptionalCarousel.vue`                                          | Créer    |
| `app/components/property/ExceptionalDuo.vue`                                               | Créer    |
| `app/components/property/ExceptionalContact.vue`                                           | Créer    |
| `app/components/property/ExceptionalSummary.vue`                                           | Créer    |
| `app/components/property/ExceptionalInfoPanel.vue`                                         | Créer    |
| `app/components/property/ExceptionalLightbox.vue`                                          | Créer    |
| `app/composables/useExceptionalRail.ts`                                                    | Créer    |
| `app/components/screen/PropertyExceptional.vue`                                            | Créer    |
| `app/pages/properties/[realEstateListing]/[accommodationCategory]/[accommodationSlug].vue` | Modifier |

---

## Tâche 1 — Mapper view-model : dérivation `hasPart → screens` (framework-agnostic)

**Fichiers :** `services/mapper/exceptional.ts` + `shared/types/exceptional.ts` (créer)

Extraire **à l'identique** la logique de dérivation du POC
`app/pages/villa-des-alizes-content.vue` (section 2 + helpers § 7/8), sans aucun import
Vue/Nuxt/Pinia. Consomme `accommodation.hasPart` (porté jusqu'au store par le spread de
`accommodation.ts`).

- [ ] Définir dans `shared/types/exceptional.ts` les contrats UI :
  - `ExceptionalScreenLayout = 'split' | 'full-overlay' | 'full' | 'triptych' | 'carousel' | 'duo' | 'contact'`
  - `ExceptionalScreenTemplate = 'SCREEN_01' … 'SCREEN_06' | 'CONTACT'`
  - `ExceptionalMedia`, `ExceptionalScreen`, `ExceptionalPropertyBadge`, `ExceptionalPropertySummary`
- [ ] Dans `services/mapper/exceptional.ts`, porter :
  - `ADDITIONAL_TYPE_TO_TEMPLATE` (mapping `SCREEN_ACCOMMODATION_*` → template), `FALLBACK_TEMPLATE`
  - `SCREEN_TEMPLATE_LAYOUTS` (template → layout)
  - helpers purs `asRecord` / `readString` / `readNumber` / `toMedia` / `slugify` / `parseHeadline`
  - `deriveExceptionalScreens(accommodation): ExceptionalScreen[]` (tri par `position`, dérivation)
  - `deriveExceptionalSummary(accommodation, screens)` (nom, localisation, référence, prix)
  - `deriveExceptionalBadges(accommodation): ExceptionalPropertyBadge[]` (surface, pièces, chambres, sdb)
  - `formatExceptionalPrice(accommodation)`
- [ ] Exporter une garde `isExceptionalProperty(accommodation): boolean` :
  - vraie si le bien expose **au moins un** bloc `hasPart` avec un `additionalType`
    reconnu **et** au moins un média ; sinon fausse (déclenche le fallback).
- [ ] Conserver le typage strict (pas de `any` non justifié), exports nommés.

## Tâche 2 — Composants d'affichage des screens (`components/property/Exceptional*.vue`)

**Fichiers :** 7 composants (créer). Affichage **pur** : props en entrée, événements en sortie,
aucune logique de rail, aucun accès store.

Chaque composant reçoit `:screen="ExceptionalScreen"` (+ `:index`, `:is-first` au besoin) et
reprend **le markup et les classes Tailwind exacts** du bloc correspondant du POC.

- [ ] `ExceptionalSplit.vue` — SCREEN_04 (split 50/50, prop `reverse`, specs/CTA). Émet `@go-next`.
- [ ] `ExceptionalOverlay.vue` — SCREEN_02 (full image + overlay, `overlayMode` dark/light, `reverse`).
- [ ] `ExceptionalFull.vue` — SCREEN_03 (full image + texte optionnel, cas `is-first` aligné à droite).
- [ ] `ExceptionalTriptych.vue` — SCREEN_01 (triptyque 3 visuels cliquables). Émet
      `@open-lightbox(media, index)` et `@go-next`.
- [ ] `ExceptionalCarousel.vue` — SCREEN_05 (mini-carousel + vignettes). Props `:active-media-index`,
      émet `@select-media(index)`. **Pas** de timer interne (l'autoplay est piloté par le composable).
- [ ] `ExceptionalDuo.vue` — SCREEN_06 (deux visuels juxtaposés + texte).
- [ ] `ExceptionalContact.vue` — écran final : titre + `FormContactProperty :property-reference`.
- [ ] Centraliser les classes de zone de texte (`IMAGE_LABEL_CLASS`, `BACKGROUND_LABEL_CLASS`,
      accents) et le helper `titleParts` dans un module partagé importé par les composants
      (ex. `app/components/property/exceptional.helpers.ts`) ou via le mapper — éviter la
      duplication entre composants.

## Tâche 3 — Surcouches extraites (synthèse, drawer, lightbox)

**Fichiers :** `ExceptionalSummary.vue`, `ExceptionalInfoPanel.vue`, `ExceptionalLightbox.vue` (créer)

- [ ] `ExceptionalSummary.vue` — région C : pastille fixe nom + prix + badges (responsive
      mobile/desktop du POC). Émet `@open-info`. Reçoit `:summary`, `:badges`. Sur mobile, un
      double chevron haut à droite du nom signale que la zone summary ouvre le bottom-sheet ;
      l'état reste exposé via `aria-expanded`.
- [ ] `ExceptionalInfoPanel.vue` — région F : drawer gauche (nom, localisation, badges,
      référence, CTA « Demander une visite »). Props `:open`, `:summary`, `:badges` ; émet
      `@close`, `@request-visit`. Évaluer la réutilisation de `PropertyDetailPanel` ; si le
      contenu diffère trop (le POC est plus light), garder un composant dédié.
- [ ] `ExceptionalLightbox.vue` — région E : overlay modal du triptyque (flèches, compteur,
      boucle). Props `:media`, `:index` ; émet `@close`, `@navigate(offset)`.

## Tâche 4 — Composable : logique du rail + coordination verticale

**Fichier :** `app/composables/useExceptionalRail.ts` (créer)

Encapsuler **toute** la logique réactive du POC (§ 5/9/10/12), SSR-safe.

- [ ] État/refs : `scrollerRef`, `rootRef`, `activeScreenId`, `galleryIndex`, `isReadingModeActive`,
      `navigationInProgress`, `prefersReducedMotion`, `isInfoPanelOpen`, `lightboxMedia`/`lightboxIndex`.
- [ ] Computeds : `activeIndex`, `progress`, `hasNextScreen`, `isAtLastScreen`, `canStartReadingMode`,
      `currentLightboxMedia`, `scrollerStyle`.
- [ ] Actions : `registerScreen`, `currentMedia`/`selectMedia`, autoplay carousel
      (`start/stopCarouselAutoplay`, intervalle `3500ms`), lightbox (`open/close/showAt`),
      `scrollToScreen`/`goToNext`, mode lecture cinématique (`start/stop/toggle`, rAF,
      `280 px/s`), `goToAdjacentScreen`, `handleWheel`, `handleKeydown`, info panel.
- [ ] **Handoff vertical (patron `ScreenPropertyList`)** : le composable expose `isAtLastScreen`
      et accepte un callback `onRequestNextScreen`. Quand on est sur le dernier écran (Contact) et
      que l'utilisateur déclenche l'affordance « continuer » (ou un geste avant en butée), il
      appelle `onRequestNextScreen` → l'orchestrateur émet `next-screen`. Le composable ne touche
      **pas** à `navigator` (la capture totale est posée par l'orchestrateur au montage).
- [ ] Lifecycle : `onMounted` (résolution `prefers-reduced-motion`, IntersectionObserver,
      listeners `wheel`/`keydown`/`pointerdown`), `onBeforeUnmount` (cleanup complet).
- [ ] Le composable ne référence aucun store : il reçoit les `screens` (déjà dérivés) en entrée.

## Tâche 5 — Orchestrateur `ScreenPropertyExceptional`

**Fichier :** `app/components/screen/PropertyExceptional.vue` (créer)

- [ ] Prop `:slug`. Lit `useAccommodationStore().getAccommodationBySlug(slug)` (comme
      `ScreenPropertyDetail`).
- [ ] Dérive `screens` / `summary` / `badges` via le mapper (Tâche 1).
- [ ] Instancie `useExceptionalRail({ screens, screenId })`.
- [ ] Template : rail `v-for` aiguillant vers le bon `PropertyExceptional*` selon `screen.layout`, + `PropertyExceptionalSummary`, progressbar (région D), bouton mode lecture (région B),
      `PropertyExceptionalLightbox`, `PropertyExceptionalInfoPanel`.
- [ ] `setScreenMeta('screen-property-detail', { type:'landing', navigator:{ enabled:false }, logo:{ visible:true }, layout:{…} })`
      — capture totale de la nav verticale (patron `ScreenPropertyList`) + logo blanc lisible sur
      imagerie sombre.
- [ ] Déclarer `defineEmits<{ (e:'next-screen'): void }>()` et émettre `next-screen` via le
      callback `onRequestNextScreen` passé au composable (handoff vers la relance).
- [ ] Respecter la structure SFC `6.script-setup-standard.md` (sections numérotées).

## Tâche 6 — Intégration page + garde + fallback

**Fichier :** `…/[accommodationSlug].vue` (modifier)

- [ ] Importer la garde `isExceptionalProperty` (mapper Tâche 1).
- [ ] Calculer `const isExceptional = computed(() => isExceptionalProperty(accommodation.value))`.
- [ ] Dans le 1er `UPageSection` (`data-screen="screen-property-detail"`) : rendre
      `<ScreenPropertyExceptional v-if="isExceptional" :slug="slug" @next-screen="next" />`
      **sinon** `<ScreenPropertyDetail :slug="slug" />`. **Conserver** relance + footer derrière.
- [ ] Récupérer `next` depuis `useScreenSystem` (comme `properties/[realEstateListing]/index.vue`)
      pour câbler `@next-screen`. Ne pas modifier la config verticale existante : la capture passe
      par `navigator.enabled:false` posé par l'orchestrateur (Tâche 5).
- [ ] Vérifier que `usePageSeo(page, …)` reste appliqué dans les deux cas (SEO inchangé).

## Tâche 7 — SSR / SEO / Accessibilité

- [ ] **SSR-safe** : toute lecture de `window`/`matchMedia` reste en `onMounted` (déjà le cas
      dans le POC). Pas d'écart d'hydratation sur le rendu initial du rail.
- [ ] **A11y** : focus management lightbox + drawer (capture clavier, `Échap`, boucle flèches),
      `aria-*` repris du POC ; `prefers-reduced-motion` désactive cinématique + autoplay.
- [ ] **Images** : `@nuxt/image` via `AppImage`, `sizes` repris du POC. **Ne jamais** utiliser
      `sizes="xs:…"` seul (srcset vide → image blanche, cf. mémoire projet).
- [ ] **i18n** : externaliser les libellés en dur du POC (« Demander une visite », labels badges,
      titres, meta description) vers les clés de traduction.

## Tâche 8 — Tests

**Fichier :** `services/mapper/exceptional.test.ts` (créer)

- [ ] `deriveExceptionalScreens` : tri par `position`, mapping `additionalType → template`,
      `FALLBACK_TEMPLATE` sur type inconnu, extraction médias, `parseHeadline` (**accent** → highlight).
- [ ] `isExceptionalProperty` : vrai avec ≥ 1 bloc valide + média, faux sinon (déclenche le fallback).
- [ ] `deriveExceptionalBadges` / `formatExceptionalPrice` : formats attendus, valeurs manquantes.

---

## Points de vigilance

- **Coordination des navigations** : répliquer le patron `ScreenPropertyList`
  (`navigator.enabled:false` + listeners propres + emit `next-screen`), ne pas réinventer. Tester
  molette, swipe mobile et flèches au passage rail → relance (et retour). L'émission `next-screen`
  doit venir d'une affordance explicite en fin de rail, pas d'une détection de geste en butée.
- **Double zone de contact** (écran Contact du rail + footer) : assumée, mais vérifier la
  cohérence éditoriale et que `FormContactProperty` reçoit bien la référence du bien.
- **Logo header** : sur imagerie sombre plein écran, garder le logo lisible (blanc) comme le POC.
- **`services/` framework-agnostic** : `exceptional.ts` ne doit importer ni Vue, ni Nuxt, ni Pinia.

## Hors périmètre

- Création/édition des blocs `hasPart` côté **dashboard** (saisie du parcours par bien).
- Suppression des démos figées `villa-des-alizes.vue` / `-mobile.vue` / `-content.vue`
  (conservées comme référence — cf. mémoire projet).
- Refactor du `ScreenPropertyDetail` de fallback.
- Migration de contenu / fixtures (le parcours consomme les `hasPart` déjà présents au store).
