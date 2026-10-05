# Médias Showcase en préprod VPS

## Chemins retenus

- Hôte VPS : `/var/www/graines-digitales/webapps/showcase-immobilier/public/images`.
- Backend : `WEBAPPS_HOST_DIR=/var/www/graines-digitales/webapps`, monté sur `/srv/webapps`.
- Projet backend : chemin média relatif `showcase-immobilier/public/images`.
- Frontend SSR : montage en lecture seule sur `/app/.output/public/images` et
  `/app/public/images` (sources IPX pour `@nuxt/image`).
- Content-sync : montage en écriture sur `/app/public/images`.
- Edge Nginx : montage en lecture seule sur `/var/www/showcase-immobilier/images`.
- URL publique inchangée : `/images/<fichier>` ; transformations : `/_ipx/...`.

Dans le `.env.preprod` du VPS, définir explicitement :

```dotenv
MEDIA_HOST_DIR=/var/www/graines-digitales/webapps/showcase-immobilier/public/images
EDGE_ALIAS=showcase-immobilier-webapp-ssr
```

Une ancienne valeur explicite de `MEDIA_HOST_DIR` prime sur le nouveau défaut Compose.
Le domaine et l’alias edge conservent leur suffixe `webapp` ; le dossier du projet
backend est `showcase-immobilier`.

## Nginx et nouveaux uploads

Le vhost edge `showcase-immobilier-webapp.conf` sert `/images/` directement depuis
le volume. Cela rend disponibles les fichiers ajoutés après le build Nuxt, sans
rebuild. L’authentification préprod reste héritée du serveur. Le sous-dossier
`/images/originals/` est bloqué : ces fichiers servent à la régénération backend.

Le montage supplémentaire du compose edge nécessite la recréation du conteneur
Nginx ; un simple reload ne suffit pas à ajouter un montage. Valider ensuite avec
`nginx -t` avant tout reload. Les corrections locales ne sont pas encore déployées.

## Contrôles à effectuer sur le VPS

1. Vérifier les montages effectifs de backend, worker, frontend et Nginx avec
   `docker inspect`, sans afficher les secrets d’environnement.
2. Contrôler les références `blueBay`, `blue-bay`, `blueprint-immobilier` dans les
   configurations actives et les chemins du projet en BDD ; conserver les noms
   des autres projets indépendants.
3. Tester une image existante sous `/images/` avec l’authentification préprod.
4. Uploader un média via le dashboard, puis tester son URL `/images/` et sa
   transformation `/_ipx/` sans rebuild. Vérifier l’affichage dans un navigateur.
5. Vérifier que `/images/originals/` retourne 404.

## Validation locale du 4 octobre 2026

Le bloc Nginx a été testé dans un conteneur Docker isolé : syntaxe valide,
image existante HTTP 200, fichier ajouté après démarrage HTTP 200, contenu reçu
identique au fichier source, originaux HTTP 404. Le conteneur de test a été supprimé.
Ce test simule l’arrivée d’un fichier ; il ne valide pas un upload réel via l’API.
La validation du vhost complet, d’IPX et des uploads sur le VPS reste à faire avec
l’accès SSH et l’authentification préprod.

## Git

`public/images/` est ignoré, y compris `public/images/originals/`. Aucun fichier
sous `public/images/` n’est suivi par Git dans le frontend contrôlé. Le volume VPS
est séparé du checkout. Ne pas utiliser `git add -f` pour les médias.

## Reconnexion locale au backend Showcase

Le 4 octobre 2026, le backend local contient le projet Showcase, 58 biens et
293 médias. Le frontend Docker est connecté à l’adresse de cette API et à
l’identifiant du projet. La synchronisation nécessite encore les identifiants
d’un compte membre du projet ; les anciennes projections de démonstration sont
conservées tant que cette synchronisation n’a pas été validée.

Le conteneur frontend est sain et `/fr` retourne HTTP 200. Une image existante et
un fichier ajouté après démarrage sont servis sous `/images/` et transformés par
`/_ipx/w_400/`, sans rebuild. Le fichier de test a été supprimé. Il s’agit d’un test
d’arrivée de fichier, pas encore d’un upload authentifié via le dashboard.

Le Dockerfile dev donne à l’utilisateur Bun les droits sur les caches Nuxt.
Les médias sont exclus du contexte Docker et restent montés au runtime.
