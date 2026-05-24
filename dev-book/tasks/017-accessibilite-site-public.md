---
status: À faire
dependances: []
---

# 017 — Accessibilité site public

## Intention

Auditer et corriger l'accessibilité du site public (hors dashboard) pour atteindre un
niveau WCAG 2.1 AA sur les parcours utilisateurs principaux.

Le site est destiné à un public large : visiteurs internationaux, locataires potentiels,
investisseurs. L'accessibilité est ici un enjeu à la fois éthique, légal et SEO.

## Périmètre

### Pages concernées

- `index.vue` — page d'accueil
- `contact.vue` — formulaire de contact
- `[...page].vue` — pages MDC génériques
- `properties/[realEstateListing]/index.vue` — liste des biens
- `properties/[realEstateListing]/[accommodationCategory]/index.vue` — catégorie
- `properties/[realEstateListing]/[accommodationCategory]/[accommodationSlug].vue` — détail bien

### Composants à auditer en priorité

- `navigation/Main.vue` — menu principal, focus, ARIA, skip-link
- `form/Contact.vue`, `form/ContactProperty.vue` — labels, erreurs, focus
- `gallery/Images.vue` — alternatives textuelles, navigation clavier
- `carousel/Panel.vue` — contrôles accessibles, ARIA live
- `screen/PropertyDetail.vue`, `screen/PropertyList.vue` — structure sémantique
- `AppLink.vue` — intitulés de liens, `aria-label` si texte ambigu
- `AppImage.vue` — attribut `alt` systématique et pertinent
- `toggle/CinemaMode.vue`, `toggle/ThemeMode.vue`, etc. — rôle `button`, état coché
- `mdc/Youtube.vue` — titre iframe, sous-titres si applicable

### Layout

- `layouts/default.vue` — `<main>`, landmark ARIA, skip navigation

## Axes d'audit

### Structure sémantique

- un seul `<h1>` par page
- hiérarchie des titres (`<h2>` > `<h3>`) sans saut
- éléments HTML natifs préférés aux divs cliquables
- landmarks ARIA : `<header>`, `<nav>`, `<main>`, `<footer>`

### Navigation clavier

- tous les éléments interactifs accessibles au clavier
- ordre de focus logique et visible
- skip-link "Aller au contenu" en tête de page
- pas de piège clavier (modales, carousel, galerie)

### Contenu alternatif

- `alt` pertinent sur toutes les `<img>` porteuses de sens
- `alt=""` sur les images décoratives
- titre explicite sur les `<iframe>` (YouTube)
- transcriptions ou sous-titres pour les vidéos si applicable

### Formulaires

- chaque `<input>` et `<textarea>` lié à un `<label>` (ou `aria-label`)
- messages d'erreur programmatiquement liés au champ (`aria-describedby`)
- retour de validation accessible (pas uniquement par couleur)

### Contraste et typographie

- ratio de contraste ≥ 4.5:1 pour le texte courant
- ratio ≥ 3:1 pour les grands textes et les icônes actionnables
- taille minimale 16px pour le corps de texte

### Composants interactifs

- toggles, boutons icônes : rôle et état ARIA (`aria-pressed`, `aria-expanded`)
- carousel / galerie : contrôles `prev`/`next` étiquetés, `aria-live` si auto-play
- modales : focus piégé dans la modale, retour au déclencheur à la fermeture

## Critères de validation

- audit Axe DevTools ou Lighthouse Accessibility ≥ 90 sur chaque page principale
- navigation clavier complète sans souris sur le parcours home → détail bien → contact
- aucun élément interactif sans intitulé accessible
- formulaire de contact utilisable uniquement au clavier avec retour d'erreur lisible
- aucune régression visuelle sur desktop et mobile

## Hors périmètre

- dashboard (traité séparément si besoin)
- internationalisation ou traductions ARIA
- tests automatisés d'accessibilité (peut faire l'objet d'une task dédiée)
