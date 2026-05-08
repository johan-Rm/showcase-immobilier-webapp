# Spec : Fusion des composables UI et ancres dans useScreenSystem

## Metadonnees

- ID : SPEC-021
- Statut : En cours
- Objectif principal : supprimer la duplication de contrat entre `useScreenSystem`, `useScreenUi` et `useScreenAnchors` en exposant une API unique pour la navigation plein ecran

---

## Description rapide

Les pages plein ecran du projet utilisent deja `useScreenSystem` pour piloter :

- les sections navigables
- l ecran courant
- les interactions clavier, touch et wheel
- les classes de transition et de mouvement

En parallele, `useScreenUi` reconstruit des props `:ui` a partir d une partie de cet etat
(`containerClass`, `touchClass`, `transitionClass`, `motionClass`) et
`useScreenAnchors` reconsomme `sections`, `currentId`, `goToId` et `container`
pour synchroniser le hash URL.

Cette separation ajoute plusieurs points de couplage inutiles : une evolution du contrat
retourne par `useScreenSystem` peut casser silencieusement `useScreenUi`,
`useScreenAnchors` et leurs consommateurs alors que la donnee source est deja disponible
au meme endroit.

Le besoin est donc de fusionner `useScreenUi` et `useScreenAnchors` dans `useScreenSystem` afin de fournir
une API unique, locale et plus robuste pour les pages qui orchestrent les screens.

---

## Probleme ou besoin observe

Avant correction, les pages devaient :

1. appeler `useScreenSystem()`
2. recuperer des sorties intermediaires
3. appeler `useScreenUi()` pour reconstruire `pageUi` et `pageSectionUi`
4. appeler `useScreenAnchors()` pour brancher la synchronisation hash

Cette chaine presente plusieurs fragilites :

- dependance artificielle entre deux composables qui manipulent le meme etat
- dependance artificielle entre trois composables qui manipulent le meme etat
- bruit de lecture dans les pages consommatrices
- risque de divergence si les classes sources evoluent d un cote sans adaptation de l autre
- risque de desalignement entre `sections/currentId/goToId` et la synchronisation des ancres
- frontieres de responsabilite trop fines pour de la logique purement derivee ou directement dependante du navigateur

Le refactor vise a reduire cette surface de couplage sans elargir le scope fonctionnel.

---

## Perimetre

Dans le scope de cette spec :

- exposer l UI ecran via un objet `screenUi` directement depuis `useScreenSystem`
- integrer une option de synchronisation des ancres dans `useScreenSystem`
- mettre a jour les pages qui consomment aujourd hui `useScreenUi` et `useScreenAnchors`
- supprimer `app/composables/useScreenUi.ts`
- supprimer `app/composables/useScreenAnchors.ts`
- verifier le typage des pages impactees

Hors scope :

- modification du comportement clavier, touch ou wheel hors recablage interne des ancres
- changement de structure HTML des pages ou des screens
- refactor plus large de `useScreenSystem`
- changement des transitions visuelles ou des classes CSS utilitaires

---

## Contraintes

- rester SSR-safe
- conserver un diff minimal et intentionnel
- ne pas changer le contrat fonctionnel des pages plein ecran
- ne pas introduire de nouvelle dependance
- garder `app/pages/` dans un role d orchestration simple

---

## Criteres d acceptation

- `useScreenSystem` retourne `screenUi.page` et `screenUi.pageSection` en plus de son API actuelle
- `useScreenSystem` peut activer la synchronisation des ancres via sa propre configuration
- les pages consommatrices n appellent plus `useScreenUi` ni `useScreenAnchors`
- `app/composables/useScreenUi.ts` est retire
- `app/composables/useScreenAnchors.ts` est retire
- le typage compile sans erreur sur les pages impactees
- aucun changement fonctionnel n est introduit dans la navigation par screen

---

## Plan d execution utile

1. ajouter les computed UI dans `useScreenSystem`
2. integrer la logique de hash et de clic d ancres dans `useScreenSystem`
3. etendre le type de retour et les options du composable
4. migrer les pages consommatrices vers la nouvelle API unique
5. supprimer les composables devenus redondants
6. verifier le typage local

---

## Points de vigilance

- garder la meme composition de classes CSS pour eviter une regression visuelle
- ne pas casser la coherence entre le track `screen-track` et les sections `UPageSection`
- verifier que la fusion ne modifie ni l hydratation ni les listeners client-only
- conserver le meme comportement de hash explicite vs navigation implicite
