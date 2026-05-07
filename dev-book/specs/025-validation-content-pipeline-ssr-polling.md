---
status: Propose
---

# 025 Validation des donnees content et gestion d erreurs en SSR polling

## Intention

Formaliser un pipeline robuste de validation des donnees chargees depuis `content/*` en mode SSR avec polling, afin de garantir des snapshots coherents, des erreurs exploitables en exploitation, et une experience utilisateur stable.

## Objectif principal

Valider systematiquement les donnees a deux etapes (DTO a la reception, modele app apres transformation), classifier les erreurs par severite, et publier uniquement des snapshots valides ou tolerables selon une politique explicite.

## Probleme ou besoin observe

Le projet charge des donnees editoriales et metier depuis `content/*`, puis les transforme via les services/mappers avant exposition dans les stores et l UI. En mode SSR non statique avec polling, les fichiers de contenu peuvent changer pendant l execution.

Sans spec de validation et de gestion d erreurs :

- des donnees invalides peuvent etre poussees en runtime
- des incoherences referentielles peuvent casser des parcours critiques
- des etats intermediaires peuvent etre servis pendant un refresh
- les erreurs peuvent rester peu actionnables pour les equipes

## Perimetre

Dans le scope de cette spec :

- definir le pipeline de validation runtime pour les donnees issues de `content/*`
- definir les controles DTO a la reception (loaders)
- definir les controles post-transformation (modele consomme par l app)
- definir la taxonomie d erreurs et le format de payload d erreur
- definir la politique de severite (`critical`, `warning`) et ses effets
- definir la publication atomique de snapshots pour SSR
- definir ou stocker et comment exposer les erreurs en production
- definir les criteres de rejet/acceptation d un nouveau lot de donnees

Hors scope :

- migration complete des schemas sources metier
- refonte des ecrans front ou du design system
- ajout d un provider externe d observabilite impose
- architecture push temps reel (SSE/WebSocket) a la place du polling

## Contexte technique et principes

- flux actuel : `content/*` -> loaders -> stores (brut) -> mappers -> modele consomme
- exigences projet : SSR-safe, SEO by design, performance stable, typage strict
- priorite : ne jamais servir un etat partiel ou incoherent quand une nouvelle version de contenu est en erreur

Principes d implementation :

- validation explicite aux frontieres utiles
- separation claire reception DTO / transformation / publication
- fail-safe en production : conserver le dernier snapshot valide
- lisibilite operationnelle : erreurs structurees et actionnables

## Taxonomie d erreurs cible

Codes et categories minimales :

- `CONTENT_SOURCE_ERROR`
  - fichier manquant, locale introuvable, frontmatter absent/invalide, parsing YAML impossible
- `DTO_SCHEMA_VALIDATION_ERROR`
  - type invalide, champ requis manquant, enum/union invalide
- `DTO_REFERENTIAL_ERROR`
  - reference vers une ressource absente detectee au niveau DTO
- `TRANSFORMATION_ERROR`
  - echec de mapping DTO -> modele app
- `DOMAIN_INVARIANT_ERROR`
  - invariant metier/app casse apres mapping (slug vide, duplicate, champ critique manquant)
- `SNAPSHOT_PUBLICATION_ERROR`
  - echec pendant la publication atomique du nouveau snapshot

Severites :

- `critical` : lot rejete, snapshot precedent conserve
- `warning` : lot publiable avec fallback explicite et trace

## Format d erreur standard

Format aligne sur la constitution :

`{ status, message, details }`

`details` doit contenir au minimum :

- `code`
- `severity`
- `resource`
- `locale`
- `file`
- `fieldPath`
- `snapshotVersion`
- `timestamp`

## Pipeline de validation cible

1. Reception et pre-validation source

- lecture/parsing des ressources `content/*`
- verification presence/shape minimale (objet vs liste, frontmatter valide)
- generation d erreurs `CONTENT_SOURCE_ERROR` si besoin

2. Validation DTO

- validation runtime contre schema DTO attendu pour chaque ressource
- constitution d un lot valide + erreurs DTO
- toute erreur `critical` bloque le lot courant

3. Transformation

- mapping DTO -> modele app via services/mappers
- capture des `TRANSFORMATION_ERROR`

4. Validation post-transformation

- controles d invariants metier et de coherence cross-ressources
- generation d erreurs `DOMAIN_INVARIANT_ERROR`
- distinction `critical` vs `warning`

5. Publication atomique de snapshot

- si lot valide (ou warnings uniquement), publication complete en une fois
- en cas d erreur `critical`, abandon du lot et conservation du snapshot precedent

## Strategie SSR + polling

- le polling produit des snapshots versionnes (`version`, `updatedAt`)
- les pages SSR lisent toujours le dernier snapshot publie
- jamais de mutation partielle visible pendant un cycle de refresh
- en cas d echec d un cycle, l app continue a servir le snapshot precedent

## Stockage et exposition des erreurs en production

1. Stockage serveur

- logs structures pour toutes les erreurs
- etat memoire du pipeline : dernier succes, dernier echec, erreurs du dernier cycle
- persistance optionnelle courte duree (ex: redis/fichier) selon infra

2. Exposition interne (ops/dev)

- endpoint interne protege (ex: `/api/internal/content-status`)
- expose indicateurs :
  - `lastSuccessAt`
  - `lastErrorAt`
  - `currentSnapshotVersion`
  - `rejectedCycles`
  - `errors` (limitees et sanitisees)

3. Affichage utilisateur final

- ne jamais afficher d erreur technique brute
- en `warning` : fallback silencieux et experience degradee maitrisee
- en `critical` avec snapshot precedent : service normal sur snapshot precedent
- en absence de snapshot valide : page d erreur generique, sobre, sans details techniques

## Contraintes non negociables

- aucune fuite de details sensibles dans les messages publics
- aucune interruption globale du rendu SSR pour une erreur de lot non publie
- aucune publication d etat partiel
- aucun `console.log` en production
- performances preservees : cout de validation compatible avec polling

## Criteres d acceptation

- chaque ressource chargee depuis `content/*` passe par une validation DTO explicite
- chaque ressource transformee passe par une validation post-transformation explicite
- la severite des erreurs est evaluee par une politique documentee (`critical`, `warning`)
- un lot avec erreur `critical` n est jamais publie
- en cas de rejet, le snapshot precedent reste servi sans interruption
- un endpoint interne de statut expose les metriques minimales de sante de pipeline
- aucun message d erreur technique brut n est expose aux utilisateurs finaux
- le format d erreur `{ status, message, details }` est respecte

## Plan d execution utile

1. Definir le contrat d erreur commun

- ajouter un type d erreur normalise et ses utilitaires de creation
- centraliser les codes d erreur et severites

2. Ajouter la couche de validation DTO

- introduire des validateurs par ressource (loaders/content)
- brancher la validation juste apres parsing

3. Ajouter la couche de validation post-transformation

- introduire des validateurs d invariants sur modeles app
- brancher la validation apres mappers

4. Introduire un gestionnaire de snapshot

- encapsuler le cycle polling en transaction logique
- publier/rejeter atomiquement les lots

5. Exposer la sante pipeline

- ajouter endpoint interne protege de statut
- ajouter journaux structures pour erreurs et decisions de publication

6. Verifier non regression

- tests unitaires des validateurs DTO et post-transformation
- tests d integration du cycle polling avec cas `warning` et `critical`
- verification SSR (pas d etat partiel, fallback snapshot precedent)

## Points de vigilance

- compatibilite multi-locale lors d un lot partiellement valide
- gestion des references croisees (media/category/listing/person)
- budget CPU/memoire de la validation a frequence de polling elevee
- hygiene SEO en mode fallback (meta et contenus critiques toujours presents)
- observabilite suffisante sans bruit excessif en logs
