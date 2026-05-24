---
status: A planifier
dependances: 008-dashboard-sauvegarde-biens-api-symfony.md
---

# 013 Traduction automatique des biens immobiliers

## Intention

Apres qu un bien est sauvegarde en FR (langue principale), traduire automatiquement
vers EN et ES les champs de traduction vides ou inexistants via un service externe.

La traduction est declenchee depuis le dashboard, traitee de facon asynchrone par
Symfony Messenger, et le front poll le statut jusqu a completion.

Le FR reste toujours la source de verite. Un champ modifie manuellement dans une
autre locale ne doit pas etre ecrase par une traduction automatique ultererieure.

## Perimetre

### Cote Symfony (api/symfony-8-api-platform)

- creer un `TranslateAccommodationCommand` et son `Handler` (Symfony Messenger)
- le handler :
  - recoit l UUID du bien et les locales cibles (EN, ES)
  - recupere les champs FR depuis `AccommodationTranslation`
  - pour chaque locale cible, traduit uniquement les champs `vides` ou `absents`
  - ne traduit pas les champs marques `modifie` (edites manuellement)
  - ecrit les traductions via l ORM
- creer ou configurer le transport Messenger (Doctrine ou Redis selon l infra)
- exposer un endpoint de declenchement :
  `POST /projects/{projectId}/accommodations/{id}/translate`
- exposer un endpoint de statut :
  `GET /projects/{projectId}/accommodations/{id}/translation-status`
  retourne `{ locale: string, status: 'pending' | 'done' | 'error', translatedAt: string }[]`

### Champs a traduire (AccommodationTranslation)

- `name`
- `label`
- `highlight`
- `body`
- `review`
- `locationDescription`
- `metaTitle`
- `metaDescription`

`slug` n est pas traduit automatiquement — il est derive du slug FR.

### Cote Nuxt (mlk-my-little-kasbah)

- activer le bouton "Traduire" dans le slideover (stub pose en task 008)
- creer la route Nitro `POST /api/dashboard/accommodations/[identifier]/translate`
  qui appelle Symfony et retourne le job ID ou le statut initial
- creer la route Nitro `GET /api/dashboard/accommodations/[identifier]/translation-status`
- dans `useDashboardSave` ou un nouveau `useDashboardTranslation` :
  - declencher la traduction via la route Nitro
  - poller le statut toutes les 3s jusqu a `done` ou `error`
  - mettre a jour les badges de statut sur les tabs de langue
  - recharger les donnees du bien apres completion

## Hors perimetre

- traduction automatique declenchee sans action utilisateur (auto apres chaque save)
- traduction du FR vers lui-meme
- modification du service de traduction depuis l UI
- gestion des quotas ou couts de traduction
- traduction des CategoryCode labels

## Contraintes

- un champ `modifie` manuellement ne doit jamais etre ecrase silencieusement
- la traduction est idempotente : rejouer ne doit pas degrader un champ deja traduit
- si le service de traduction externe est indisponible, retourner une erreur claire
  sans corrompre les donnees existantes
- le JWT de service Symfony (task 008) est reutilise pour les appels de traduction

## Architecture

### Marquage des champs manuellement modifies

Deux options a arbitrer en implementation :

**Option A** : champ `isManuallyEdited` booleen par `AccommodationTranslation`
— simple mais peu granulaire (toute la traduction ou rien)

**Option B** : colonne JSON `manualFields: string[]` dans `AccommodationTranslation`
— granulaire par champ, plus complexe

Recommandation : Option A pour V1, migrer vers B si le besoin emerge.

### Service de traduction

A choisir avant l implementation :

| Service        | Qualite FR→AR | Prix        | SDK PHP |
| -------------- | ------------- | ----------- | ------- |
| DeepL          | Excellent     | Freemium    | Oui     |
| Google         | Tres bon      | Pay-as-you  | Oui     |
| LibreTranslate | Moyen         | Self-hosted | Oui     |

Recommandation : DeepL pour la qualite sur le francais et les langues cibles.

### Flux complet

```
Bouton "Traduire" (dashboard)
  └─ POST /api/dashboard/accommodations/[identifier]/translate  (Nitro)
       └─ POST /projects/{projectId}/accommodations/{id}/translate  (Symfony)
            └─ dispatch TranslateAccommodationCommand (Messenger async)
                 └─ TranslateAccommodationHandler
                      ├─ fetch traduction FR depuis BDD
                      ├─ appel DeepL pour chaque champ vide par locale cible
                      └─ write AccommodationTranslation EN + ES

Dashboard poll GET /api/dashboard/.../translation-status toutes les 3s
  └─ quand status = done → refresh donnees bien → badges locales mis a jour
```

## Etapes (a detailler au moment de l implementation)

- [ ] Choisir le service de traduction et obtenir les credentials
- [ ] Configurer Symfony Messenger (transport, worker)
- [ ] Implementer `TranslateAccommodationCommand` + Handler + service DeepL
- [ ] Ajouter les endpoints translate et translation-status dans Symfony
- [ ] Ajouter le marquage `isManuallyEdited` dans `AccommodationTranslation`
- [ ] Routes Nitro translate + translation-status
- [ ] Composable `useDashboardTranslation` avec polling 3s
- [ ] Activer le bouton "Traduire" et brancher les badges de statut

## Points de vigilance

- **Couts** : chaque traduction consomme des credits DeepL — ne pas traduire
  automatiquement sans action explicite utilisateur pour eviter les derives.
- **Idempotence** : le handler doit verifier l etat actuel avant d ecrire
  pour ne pas ecraser un champ deja traduit.
- **Worker Messenger** : en production, un worker Symfony doit tourner en continu.
  A prevoir dans le `docker-compose.prod.yml` du projet Symfony.
- **Langue arabe** : si AR est ajoute plus tard, verifier le support RTL dans
  `AccommodationTranslation` et dans l UI du slideover.
