---
status: A planifier
dependances: 008-dashboard-sauvegarde-biens-api-symfony.md
---

# 012 Dashboard — Upload et modification de medias

## Intention

Permettre a l utilisateur du dashboard de gerer les medias d un bien immobilier :
upload de nouvelles images, reordering, edition des metadonnees (caption, keywords,
representativeOfPage) et suppression logique.

La task 007 a produit une galerie media read-only dans l onglet Media du slideover.
Cette task active les actions d ecriture sur cette galerie.

## Perimetre pressenti

- upload d une ou plusieurs images pour un bien (multipart via Symfony VichUploaderBundle)
- reordering des images (drag & drop ou fleches)
- edition inline : caption, keywords, representativeOfPage
- suppression logique d un media (retrait de l association, pas suppression physique)
- mise a jour de `associatedMedia` en BDD via Symfony
- re-export Markdown du bien apres modification media (circuit task 009)

## Etat actuel du contrat

La route BFF d upload media relaie vers
`POST /api/projects/{projectId}/media-objects/translations` en multipart. Le endpoint
global `POST /api/media-objects` n est pas expose par le backend actuel.

Payload multipart envoye a Symfony :

```txt
file: File
translations: [{"locale":"fr","caption":"Patio lumineux de riad"}]
```

La reponse Symfony est normalisee cote Nuxt avec `id`, `identifier`, `contentUrl`,
`originalFilename` et `@id` quand disponibles.

L association des medias au bien n est pas encore incluse dans le mapper de sauvegarde
Accommodation : `associatedMedia` et `image[]` restent exclus du payload du bien.

## Hors perimetre

- suppression physique de fichiers media sur le serveur
- bibliotheque media globale projet (tous les assets hors contexte d un bien)
- recadrage ou traitement d image
- upload en masse

## Points a affiner

- format et taille max des images acceptes (VichUploaderBundle config Symfony)
- resolution des URLs d apercu : chemins locaux `/images/...` vs UUIDs Directus
  (question ouverte identifiee en task 007)
- gestion du checksumSha256 calcule cote serveur Symfony
- comportement si un MediaObject avec le meme checksum existe deja en BDD
