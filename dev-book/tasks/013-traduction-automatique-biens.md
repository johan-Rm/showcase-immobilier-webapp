---
status: En cours
dependances: 008-dashboard-sauvegarde-biens-api-symfony.md
source: contrat backend dashboard-accommodation-save du 2026-05-22
---

# 013 Dashboard - Sauvegarde multi-langue des biens immobiliers

## Intention

Permettre au dashboard Nuxt de sauvegarder un bien immobilier en plusieurs langues
depuis le slideover d edition, en conservant l `identifier` metier comme identifiant
stable commun a toutes les locales.

La V1 ne declenche pas un job de traduction separe. Le dashboard envoie les traductions
connues dans le payload de sauvegarde, et l API Symfony complete automatiquement les
champs localises absents, `null` ou vides a partir de la locale source.

Le besoin produit est simple : un utilisateur peut modifier FR, EN et ES, sauvegarder le
bien, puis laisser l API remplir uniquement les champs manquants sans ecraser les
traductions personnalisees deja saisies.

## Contrat backend de reference

Repo backend :
`/home/johan/www/graines-digitales/api/symfony-8-api-platform`

Documents de reference :

- `docs/03-api-contracts/dashboard-accommodation-save.md`
- `docs/03-api-contracts/index.md`
- `dev-book/tasks/012-dashboard-accommodation-save.md`

Endpoint BFF appele par le dashboard :

```txt
PUT /api/dashboard/accommodations/{identifier}?locale={locale}
```

Routes Symfony appelees par Nitro :

```txt
POST /api/projects/{projectId}/accommodations/translations?locale={locale}
PUT /api/projects/{projectId}/accommodations/{identifier}/translations?locale={locale}
```

Contraintes contractuelles :

- `identifier` est commun a toutes les locales.
- `locale` indique la locale source ou la locale cible du contexte de sauvegarde.
- les champs globaux de l `Accommodation` restent communs a toutes les locales.
- les champs localises sont envoyes dans `translations`, y compris pour une sauvegarde
  mono-locale du dashboard.
- une valeur non vide est consideree comme personnalisee et ne doit pas etre ecrasee par
  la traduction automatique.
- une valeur absente, `null` ou vide peut etre completee automatiquement par l API.
- le dashboard doit envoyer uniquement les champs modifies et les traductions concernees
  pour limiter les ecrasements involontaires.

## Payloads attendus

### Sauvegarde mono-locale dashboard

Le dashboard envoie toujours la traduction de la locale courante dans `translations[]`.
Les champs metier globaux restent a la racine.

```json
{
  "identifier": "BAVLC001",
  "category": "/api/category-codes/accommodation-type-local-commercial",
  "realEstateListing": "/api/category-codes/real-estate-listing-bien-a-vendre",
  "offerPrice": "350000",
  "translations": [
    {
      "locale": "fr",
      "slug": "local-commercial-erraounak",
      "name": "Superbe local commercial a Erraounak",
      "body": "<p>Local commercial renove.</p>",
      "metaTitle": "Local commercial a vendre a Essaouira",
      "metaDescription": "Local commercial renove a Erraounak.",
      "locationDescription": "Erraounak, Essaouira."
    }
  ]
}
```

### Sauvegarde multi-langue

Le dashboard peut envoyer plusieurs traductions connues :

```json
{
  "translations": [
    {
      "locale": "fr",
      "name": "Superbe local commercial a Erraounak",
      "body": "<p>Texte source.</p>",
      "locationDescription": "Erraounak, Essaouira."
    },
    {
      "locale": "en",
      "name": "Custom English title",
      "body": "",
      "locationDescription": ""
    },
    {
      "locale": "es",
      "name": "",
      "body": ""
    }
  ]
}
```

Dans cet exemple :

- `en.name` est preserve car il contient une valeur personnalisee non vide.
- `en.body`, `es.name` et `es.body` peuvent etre completes automatiquement.
- les champs absents, `null` ou vides peuvent etre completes par le backend.

## Champs localises geres

- `slug`
- `name`
- `label`
- `highlight`
- `body`
- `review`
- `metaTitle`
- `metaDescription`
- `locationDescription`

Les champs metier globaux ne doivent pas etre dupliques dans chaque objet de traduction.
Ils restent mappes une seule fois au niveau racine du payload API Platform.

## Perimetre Nuxt

- adapter le modele d edition dashboard pour distinguer :
  - les champs globaux du bien
  - les champs localises par locale
  - les champs modifies depuis l ouverture du slideover
- adapter `useDashboardSave` ou extraire un helper dedie pour construire un payload
  mono-locale ou multi-langue selon le contexte.
- adapter la route Nitro `PUT /api/dashboard/accommodations/[identifier]` pour relayer
  le payload `translations` vers Symfony sans exposer le JWT de service au client.
- maintenir la resolution des `CategoryCode` en IRI avant envoi.
- afficher dans l UI l etat de chaque locale :
  - source
  - personnalisee
  - incomplete
  - sauvegardee
  - erreur
- permettre a l utilisateur de vider explicitement un champ traduit pour demander une
  regeneration automatique par l API.
- recharger les donnees du bien apres sauvegarde afin d afficher les traductions
  completees par le backend.

## Hors perimetre

- job de traduction asynchrone declenche par un bouton separe
- polling de statut de traduction
- endpoint dedie `translate` ou `translation-status`
- configuration du client Google Translate cote Nuxt
- gestion des quotas, couts ou credentials du service de traduction
- traduction automatique sans action utilisateur
- traduction des libelles `CategoryCode`
- sauvegarde des medias ou re-export Markdown, deja couverts par d autres tasks

## Contraintes produit et techniques

- i18n actif : tout texte visible ajoute dans l UI passe par les cles de traduction.
- SSR-safe : la logique d edition et de sauvegarde reste declenchee explicitement cote
  dashboard, sans effet client-only global.
- services framework-agnostic : aucune logique metier pure ne doit dependre de Vue,
  Nuxt ou Pinia.
- ne jamais exposer le JWT de service Symfony au navigateur.
- ne jamais ecraser silencieusement une traduction non vide.
- ne pas envoyer de champs inchanges si le dashboard peut les identifier.
- en cas d erreur Symfony, afficher un message clair sans fermer le slideover.

## Architecture cible

```txt
Dashboard slideover
  └─ edition FR / EN / ES
      └─ useDashboardSave.save(accommodation, locale)
            └─ PUT /api/dashboard/accommodations/[identifier] (Nitro)
                 ├─ requireUserSession(event)
                 ├─ getSymfonyServiceToken()
                 ├─ map champs globaux + CategoryCode IRIs deja resolus
                 ├─ preserve translations[] localisees
                 ├─ PUT /api/projects/{projectId}/accommodations/{identifier}/translations?locale={locale}
                 └─ fallback POST /api/projects/{projectId}/accommodations/translations?locale={locale}

API Symfony
  ├─ persiste les champs globaux communs
  ├─ persiste les traductions non vides fournies
  ├─ complete les champs vides/absents depuis la locale source
  └─ retourne le bien sauvegarde
```

## Etapes

- [x] Auditer l etat actuel de `PropertyWorkspace`, du slideover d edition et de
      `useDashboardSave`.
- [ ] Identifier la structure locale des donnees FR / EN / ES dans le dashboard.
- [x] Definir un type strict pour les champs localises sauvegardables.
- [x] Definir un type strict pour `translations[]`.
- [x] Adapter le mapper dashboard vers API Platform pour separer champs globaux et
      champs localises.
- [x] Adapter la route Nitro `PUT /api/dashboard/accommodations/[identifier]` pour
      accepter un payload multi-langue.
- [x] Adapter `useDashboardSave` avec une action explicite de sauvegarde multi-langue.
- [ ] Brancher l UI de tabs langue sur les statuts de champs incomplets/personnalises.
- [ ] Recharger le bien apres sauvegarde pour recuperer les traductions completees par
      l API.
- [x] Ajouter ou adapter les tests utiles sur le mapper.
- [ ] Valider `bun run quality:check`.

## Points de vigilance

- **Contrat API** : le front doit appeler la route par `identifier`, pas par UUID Doctrine.
- **Donnees** : les `CategoryCode` restent resolus en IRI avant envoi.
- **Ecrasement** : une valeur non vide envoyee est une intention utilisateur et doit etre
  preservee par le backend.
- **Regeneration** : pour demander une regeneration automatique, le front doit envoyer le
  champ absent, `null` ou vide.
- **UX** : vider un champ peut etre une action destructive pour l utilisateur ; l interface
  doit rendre cette intention explicite.
- **Performance** : eviter de sauvegarder toutes les locales et tous les champs si seuls
  quelques champs ont ete modifies.
