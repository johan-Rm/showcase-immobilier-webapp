# 037 — BFF content-first et projections de lecture persistantes

## Contexte

Le runtime public et le dashboard disposent de deux chemins de lecture concurrents :

- les fichiers localises dans `content/` ;
- des GET directs vers l API Symfony pour les medias, les CategoryCodes et certaines traductions.

Cette duplication provoque des divergences de donnees et expose au frontend des valeurs
d infrastructure, notamment des URL absolues contenant `localhost`.

## Contrat cible

- Symfony est le modele d ecriture durable des commandes du dashboard.
- `content/` est la projection de lecture runtime, commune au site public et au dashboard.
- Pinia est uniquement un cache reactif client des donnees lues depuis `content/`.
- `content-sync` reste un outil de bootstrap et de reconciliation API vers fichiers.
- Les appels Symfony de statut, authentification et configuration projet restent des exceptions
  d infrastructure autorisees.

## Flux

```text
Lecture : content -> BFF file-backed -> store -> UI
Ecriture : UI -> BFF -> Symfony -> projection content -> reponse normalisee -> store
Reconciliation : Symfony -> content-sync -> content
```

## Travaux

1. Monter `content/` dans un volume persistant en preproduction et production.
2. Ajouter des writers YAML atomiques pour `media-object.yaml` et `category-code.yaml`.
3. Apres upload media, projeter le media dans les fichiers des locales activees avec une URL
   relative et `dateModified`.
4. Apres creation ou modification d un CategoryCode, mettre a jour les fichiers localises.
5. Basculer les lectures medias et CategoryCodes du dashboard sur les fichiers.
6. Resoudre les UUID et IRI Symfony cote BFF lors des commandes.
7. Lire les traductions de biens depuis les fichiers et exporter toutes les locales modifiees.
8. Conserver un resultat explicite quand Symfony est a jour mais que la projection fichier echoue.

## Invariants

- Une URL stockee dans `media-object.yaml` est relative au site (`/images/...`).
- Un identifiant media ou CategoryCode reste stable entre locales.
- Une ecriture YAML remplace le fichier de facon atomique.
- Une lecture metier runtime ne depend pas de la disponibilite de Symfony.
- Les ecritures concurrentes dans un meme process ne doivent pas perdre de mise a jour.

## Validation

- Les galeries fonctionnent sans `GET /api/projects/.../media-objects`.
- Les options dashboard fonctionnent sans `GET /api/projects/.../category-codes`.
- Un upload apparait apres rechargement depuis `content/`.
- Le tri media utilise `dateModified DESC`.
- Les fichiers modifies survivent au redemarrage du conteneur SSR.
- Les quality gates du projet passent avant commit.
