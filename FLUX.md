# Flux de rendu prioritaire

Ce document formalise le flux cible pour privilegier le premier rendu visible avant toute initialisation metier non critique.

## Objectif

Afficher immediatement un ecran plein viewport minimal avec le logo centre, puis lancer le bootstrap applicatif en arriere-plan sans bloquer le rendu initial.

## Sequence cible

### 1. T0 SSR

- Le serveur rend un shell plein ecran minimal.
- Le shell contient uniquement le fond, le logo centre et la structure semantique minimale.
- Aucun fetch metier ne doit conditionner ce premier rendu.

### 2. T0 Hydratation

- Le client hydrate le shell tel quel, sans divergence visuelle serveur/client.
- Le bootstrap global demarre en asynchrone non bloquant.
- Le shell reste visible tant que l application principale n est pas prete.

### 3. Bootstrap applicatif

- `initCoreData()` charge les donnees core en arriere-plan.
- Les donnees non critiques restent explicitement differees apres le premier rendu.
- Les erreurs de bootstrap doivent etre tracees sans casser le shell initial.

### 4. Transition vers l application

- Quand les donnees strictement necessaires sont pretes, l application passe a l etat `ready`.
- Le shell logo disparait via une transition courte et sobre.
- Les elements globaux non critiques ne sont montes qu apres cette transition ou apres `ready`.

## Responsabilites

### `app/app.vue`

- Orchestration du boot global.
- Gestion de l etat de bootstrap.
- Rendu du shell initial ou de l application principale selon l etat.

### Shell de boot

- Affichage uniquement.
- Zero logique metier.
- Zero dependance a un store de contenu ou a un loader metier.

### `useNuxtServerInit`

- Charge les donnees core.
- N impose pas de blocage du premier rendu.
- Distingue explicitement donnees critiques et donnees d arriere-plan.

## Invariants

- SSR-safe par defaut.
- Hydratation stable.
- Pas d attente reseau bloquante pour afficher le shell initial.
- Pas d animation lourde ou media lourd sur le premier ecran.
- Le logo doit rester leger et adapte a un LCP rapide.

## Points de vigilance

- SEO: les metas critiques ne doivent pas dependre d un bootstrap client tardif.
- UX: eviter un flash ou une double transition trop longue entre shell et contenu.
- Performance: ne pas reintroduire dans le shell des composants globaux lourds.
- Accessibilite: conserver une structure lisible, un titre de page et des contrastes suffisants.

## Critere de succes

- Le premier rendu visible correspond au shell logo plein ecran.
- `FCP` et `LCP` sont portes par ce shell, et non par des donnees metier ou un layout lourd.
- Le bootstrap applicatif se fait en arriere-plan sans bloquer l affichage initial.
