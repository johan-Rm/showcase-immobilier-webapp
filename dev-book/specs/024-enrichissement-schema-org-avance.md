---
status: Propose
---

# 024 Enrichissement Schema.org Avance

## Intention

Prolonger le socle SEO actuel avec des noeuds et proprietes schema.org plus riches, sans remettre en cause l architecture mise en place autour de `usePageSeo()` et `services/seo/schema.ts`.

## Objectif principal

Ameliorer la qualite semantique du graphe JSON-LD pour les pages editoriales, les listes de biens et les fiches bien, tout en gardant des contrats stricts et des responsabilites claires entre entrypoints, composables et services.

## Perimetre

- enrichir `Organization`
- enrichir `WebSite`
- enrichir `Accommodation`
- enrichir `Offer`
- enrichir `ItemList`
- etudier les cas ou `Article` est plus adapte que `WebPage`

## Hors perimetre

- refonte globale des schemas source partagees sans besoin explicite
- ajout de nouveaux providers SEO externes
- modifications de design ou de routing sans lien direct avec les donnees structurees

## User stories

- En tant que moteur de recherche, je recois un `WebSite` coherent, relie a `Organization` et `WebPage`.
- En tant que moteur de recherche, je peux comprendre plus finement une fiche bien via des proprietes `Accommodation` et `Offer` plus explicites.
- En tant que moteur de recherche, je peux interpreter une liste de biens comme une collection ordonnee d objets immobiliers homogenes.
- En tant qu equipe projet, nous pouvons enrichir le graphe sans reintroduire de logique metier floue dans `schema.ts`.

## Pistes d enrichissement

- `Organization`
  - `sameAs`
  - `contactPoint`
  - `areaServed`
  - adresse structuree
- `WebSite`
  - `publisher`
  - `inLanguage`
  - eventuelle `potentialAction` de recherche si le produit le justifie
- `Accommodation`
  - `amenityFeature`
  - `occupancy`
  - `yearBuilt`
  - type plus precis si le metier permet de distinguer appartement, riad, villa, terrain
- `Offer`
  - `availability`
  - `seller`
  - `url`
  - `priceValidUntil`
- `ItemList`
  - `name`
  - `description`
  - `url`
- pages editoriales
  - evaluer `Article` pour les pages qui relèvent d un contenu editorial long ou informationnel

## Contraintes

- garder `pages/` comme entrypoints d intention
- garder `usePageSeo()` comme orchestrateur reactive
- garder `services/seo/schema.ts` comme couche de projection JSON-LD
- ne pas multiplier les fallbacks si le contrat source peut etre durci
- toute propriete ajoutee doit etre alimentee par une donnee reelle et fiable

## Criteres d acceptation

- un noeud `WebSite` coherent est present et relie correctement `Organization` et `WebPage`
- les enrichissements retenus pour `Organization`, `Accommodation`, `Offer` et `ItemList` sont documentes et justifies
- les champs schema.org ajoutes reposent sur des contrats stricts ou sur une decision explicite de fallback
- les quality gates du projet repassent une fois le probleme outillage ESLint traite

## Plan d execution

1. auditer les donnees disponibles cote `content/`, `stores` et `schemas` pour chaque enrichissement envisage
2. lister les champs schema.org ajoutes avec leur source de verite
3. durcir les contrats source si necessaire avant d enrichir `schema.ts`
4. implementer les enrichissements par noeud, avec verification SSR du rendu JSON-LD
5. documenter les choix de modelisation retenus
