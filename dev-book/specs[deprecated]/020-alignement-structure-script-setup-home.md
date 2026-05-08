# Spec : Alignement structure script setup page home

## Metadonnees

- ID : SPEC-020
- Statut : En cours
- Objectif principal : realigner `app/pages/index.vue` sur le standard local `script setup` sans changer son comportement

---

## Description rapide

La page d accueil respecte deja globalement son role d orchestration, mais son bloc
`<script setup lang="ts">` presentait un ordre de lecture partiellement melange entre :

- constantes statiques
- composables de contexte
- etat local
- helper local
- valeurs derivees pour le template

Le besoin est de remettre ce fichier dans un ordre plus conforme au standard local
documente dans `docs/2.architecture/6.script-setup-standard.md`, afin de rendre
la structure plus immediate a comprendre en review et en maintenance.

---

## Probleme ou besoin observe

Avant correction, `app/pages/index.vue` restait lisible mais plusieurs zones du script
setup etaient entrelacees :

- `useRoute()` apparaissait avant la fin des constantes statiques
- `pageRef` et `transitionMode` etaient declares plus bas que leur role structurel ne le suggere
- le helper `getComponentByIdentifier` etait melange a la zone des data inputs

Cet etat ne provoquait pas de bug, mais ralentissait la lecture du fichier au regard du
standard de structure local.

---

## Perimetre

Dans le scope de cette spec :

- reordonner les blocs du `script setup` de `app/pages/index.vue`
- conserver une responsabilite dominante de page d orchestration
- isoler le helper local de resolution de composants de page
- ne pas changer le comportement fonctionnel, SSR ou SEO de la page

Hors scope :

- refactor des composables utilises par la page
- modification du template ou des composants d ecran
- ajout de logique metier, de donnees ou de nouveaux tests
- extension du chantier a d autres pages ou composants

---

## Contraintes

- respecter `docs/2.architecture/6.script-setup-standard.md`
- conserver un diff minimal et intentionnel
- ne pas modifier les contrats utilises par `useWebPage`, `useScreenSystem`, `useScreenUi` ou `useScreenAnchors`
- rester SSR-safe et sans dependance DOM supplementaire

---

## Criteres d acceptation

- `app/pages/index.vue` expose une structure lisible suivant globalement l ordre :
  imports, types/constantes, composables, etat local, helpers, computed, effets
- `transitionMode` figure dans la zone des constantes statiques
- `pageRef` figure dans la zone d etat local
- `getComponentByIdentifier` est isole comme helper local avant les computed qui l utilisent
- aucun changement de comportement fonctionnel n est introduit dans la page home

---

## Plan d execution utile

1. relire le standard local `script setup`
2. identifier les zones mal ordonnees dans `app/pages/index.vue`
3. reordonner les declarations sans modifier la logique
4. verifier la lisibilite finale du fichier et l absence de changement de comportement visible

---

## Points de vigilance

- ne pas transformer un simple realignement structurel en refactor plus large
- ne pas deplacer une declaration dans une zone qui casserait une dependance reactive implicite
- garder une lecture simple du flux : source des donnees, helper local, valeurs preparees, orchestration
