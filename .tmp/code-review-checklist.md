# Checklist de contrôle — Code Review

## Principes Egoless

| Désignation | Type | Tags |
|---|---|---|
| Critiquez le code, pas les individus | Egoless principles | Code Review, Checklist Control, Egoless principles |
| Accepter de faire des erreurs | Egoless principles | Code Review, Checklist Control, Egoless principles |
| Vous n'êtes pas votre code (ne le prenez pas personnellement) | Egoless principles | Code Review, Checklist Control, Egoless principles |
| Évitez le vocabulaire négatif | Egoless principles | Code Review, Checklist Control, Egoless principles |
| Mettre en valeur les réussites | Egoless principles | Code Review, Checklist Control, Egoless principles |
| Comprendre facilement l'intention du code | Egoless principles | Code Review, Checklist Control, Egoless principles |

## Clean Code & Bonnes pratiques

| Désignation | Type | Tags | Liens |
|---|---|---|---|
| Les fonctions sont-elles courtes | Bonnes pratiques | Code Review, Checklist Control, Readability | |
| Écrire du code léger | Clean code | Code Review, Expected, Checklist Control | |
| Écrire du code qualitatif | Clean code | Code Review, Expected, Checklist Control | |
| Écrire du code lisible | Clean code | Code Review, Expected, Checklist Control | |
| Écrire du code refactorisé | Clean code | Code Review, Expected, Checklist Control | |
| Écrire du code testé | Clean code | Code Review, Expected, Checklist Control | |
| Écrire du code commenté/documenté | Clean code | Code Review, Expected, Checklist Control | |
| Utiliser les principes SOLID, KISS, SRI, YAGNI, SOC and More... | Bonnes pratiques | Code Review, Expected, Checklist Control | https://thefullstack.xyz/dry-yagni-kiss-tdd-soc-bdfu — https://thefullstack.xyz/solid-javascript/ |
| Pratiquer le clean code | Code Review | Code Review | 12 règles pour faire du clean code - All4Test |
| Être attentif au code dupliqué | Bonnes pratiques | Code Review, Coding Standard, Vue, Checklist Control | |
| Le changement de code permet-il d'obtenir le résultat souhaité de manière simple et efficace | Bonnes pratiques | Code Review, Universal Issues | |
| Le code de journalisation ou de débogage est-il supprimé | Code Review | Performance | |

## Documentation

| Désignation | Type | Tags | Liens |
|---|---|---|---|
| Être agréable à lire | Documentation | Code Review, Checklist Control, Documentation | https://www.techsmith.fr/blog/documentation-technique/ |
| Ajouter des visuels | Documentation | Code Review, Checklist Control, Documentation | Writing Self-Documenting Code |
| Documenter en même temps que le code | Documentation | Code Review, Checklist Control, Documentation | |
| Écrire au présent, à la voix active | Documentation | Code Review, Checklist Control, Documentation | |

## Tests unitaires et automatisation

| Désignation | Type |
|---|---|
| Les tests sont-ils bien documentés ? | Unit Testing and Automation |
| Les tests couvrent-ils toutes les modifications du code ? | Unit Testing and Automation |
| Les tests testent-ils réellement ce qu'ils sont censés tester ? | Unit Testing and Automation |
| Les tests sont-ils suffisamment isolés pour permettre de trouver facilement les problèmes ? | Unit Testing and Automation |
| Le changement de code affecte-t-il le fonctionnement des tests existants ? | Unit Testing and Automation |

## Standards Vue / SCSS / Architecture

| Désignation | Type | Tags |
|---|---|---|
| Ne pas utiliser directement les composants d'une librairie tierce dans les WebApps, créer d'abord un composant global dans lib/vue | Smart-ERM | Code Review, Checklist Control, Design, Contributing |
| Déplacer tous les traitements back-end effectués au niveau des composants UX/UI, côté server ou côté lib/js | Smart-ERM | Code Review, Checklist Control, Smart-ERM, Vue, Amélioration, Architecture |
| Créer un fichier .scss séparé pour les composants lib/vue uniquement lorsqu'il est nécessaire d'avoir accès aux variables Bootstrap | Smart-ERM | Code Review, Checklist Control, Design, Contributing, CSS, SCSS |
| Utiliser le state lorsque plusieurs composants partagent un état commun | Smart-ERM | Code Review, Coding Standard, VueJS, State Management |
| Une propriété "computed" est utilisée pour décrire de manière déclarative une valeur qui dépend d'autres valeurs | Smart-ERM | Code Review, Coding Standard, VueJS |
| Encapsuler les composants Vue avec une class css sur l'élément Root | Smart-ERM | Code Review, Checklist Control, Design, Contributing, CSS, SCSS |
| Connaître les bonnes pratiques et méthodologie SASS/SCSS (BEM, OOCSS) | Bonnes pratiques | Code Review, Checklist Control, Design, Contributing, CSS, SCSS |
| Utiliser uniquement la charge utile lors des mutations de l'état des données | Smart-ERM | Code Review, Coding Standard, Vue, Checklist Control |
| Nommer les variables ou fonctions sans contexte dans le cas où le composant ou la classe utilisée le définit déjà | Smart-ERM | Code Review, Coding Standard, Vue, Checklist Control |
| Ne pas charger de librairie via CDN | Smart-ERM | Code Review, Checklist Control |
| Ne pas insérer de css "inline" | Smart-ERM | Code Review, Coding Standard, Vue, Checklist Control |

## Conventions générales

| Désignation | Type | Tags |
|---|---|---|
| Utiliser un langage commun | Bonnes pratiques | Code Review, Checklist Control |
| Respecter la convention de nommage déjà en place | Bonnes pratiques | Code Review, Checklist Control |
| Réaliser des revues de code constructives | La base | Code Review, Checklist Control |
| Détecter toute idée fausse du code | La base | Code Review, Checklist Control |
| Vérifier la bonne rédaction du code | La base | Code Review, Checklist Control |
| Comprendre le code | La base | Code Review, Checklist Control |

## Process — Mise en place d'une feature

| Étape | Type | Tags |
|---|---|---|
| 1. Définir les règles de gestion (suite à l'expression du besoin => CDC, Brief Trello…) | Features | Features, Process, Set Up |
| 2. Réaliser un mockup | Features | Features, Process, Set Up |
| 3. Créer un plan de migration | Features | Features, Process, Set Up |
| 4. Créer un plan de développement | Features | Features, Process, Set Up |
| 5. Mise en place des tests unitaires et fonctionnels | Features | Features, Process, Set Up |
| 6. Documenter les nouvelles fonctionnalités | Features | Features, Process, Set Up |

## Gestion de projet / Estimation

| Désignation | Type | Tags | Liens |
|---|---|---|---|
| Faire des estimations optimistes | PMP | PMP, Estimation de charge | https://alm.developpez.com/actu/293707/ |
| Ne pas allouer un temps énorme à estimer les délais | PMP | PMP, Estimation de charge | |
| Y a-t-il eu erreur dans l'estimation ? | PMP | PMP, Analyse | |
| Le code édité correspond-il bien à la demande initiale ? | PMP | PMP, Analyse | |
| Extraire les temps saisis lors de la phase de QA | PMP | PMP, Analyse | |
