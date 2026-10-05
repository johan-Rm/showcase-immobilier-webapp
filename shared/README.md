# shared/

Code partagé entre la couche Vue (`app/`) et la couche serveur (`server/`).

## Rôle et responsabilités

**Rôle Nuxt :** le dossier `shared/` héberge le code utilisable à la fois par l'app Vue et
par le serveur Nitro. Nuxt auto-importe le premier niveau de `shared/utils/` et
`shared/types/` des deux côtés ; le reste s'importe explicitement via l'alias `#shared`.
Réf. : [doc Nuxt — `shared/`](https://nuxt.com/docs/4.x/directory-structure/shared).

**Rôle attendu :** cette couche porte les briques neutres communes aux deux runtimes —
helpers purs, constantes et contrats de types transverses. Son code ne dépend d'aucun
runtime (ni Vue, ni Nitro, ni DOM, ni route, ni store) : c'est la condition pour qu'il
s'exécute indifféremment côté client et côté serveur. Ce qui est propre à un seul runtime
appartient à sa couche dédiée.

## Conventions techniques

Aucune règle CI spécifique à ce dossier à ce jour.
