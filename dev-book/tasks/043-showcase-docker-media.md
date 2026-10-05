---
status: Terminé
source: demandes utilisateur — setup Docker et chemins des médias préprod
---

# 043 — Setup Docker et montages médias Showcase

**Statut** : ✅ fait le 2026-10-05
**Type** : fix
**Tests** : commandes Docker réelles, setup complet, HTTP images et IPX.

## Cadrage

Carte rédigée après implémentation : les corrections ont été demandées au fil
des essais utilisateur. Le projet utilise ses commandes Make existantes.

## Livré

- Montage `.env` et fixtures en lecture seule pour le setup local.
- Permissions des caches Nuxt adaptées à l’utilisateur du conteneur dev.
- Métadonnées Git montées en lecture seule pour les contrôles de conventions Make.
- Médias exclus du contexte de build et conservés dans les montages runtime.
- Chemin hôte préprod `/var/www/graines-digitales/webapps/showcase-immobilier/public/images`.
- Montages SSR en lecture seule, y compris les sources IPX, et préflight aligné.
- Documentation du reset, du vhost et des limites de synchronisation.

## Vérification

- Setup complet Docker réussi après correction de l’absence de `.env` interne.
- Hash de `.env` identique avant/après ; aucune photo originale supprimée.
- Conteneur frontend sain, accueil `/fr` en HTTP 200.
- Image existante et fichier ajouté après démarrage : HTTP 200 sous `/images/`
  et via IPX ; contenu reçu identique, fichier temporaire supprimé.
- L’utilisateur confirme `http://webapp.localhost:8080/fr` fonctionnel.
- Compose préprod résolu : un montage content-sync en écriture et deux montages
  SSR en lecture seule sur le même dossier média hôte.
- Médias ignorés par Git ; aucun fichier de `public/images/` suivi.

## Définition de terminé

- [x] Commande de setup Docker rejouable.
- [x] Permissions et montages corrigés sans suppression des originaux.
- [x] Configuration préprod locale cohérente avec le nouveau stockage.
- [x] Documentation et contrôles réels disponibles.

## Hors périmètre

Déploiement sur le VPS, véritables uploads via le dashboard et modifications du
dépôt edge voisin : ses changements ne sont pas inclus dans ce commit frontend.

## Validation avant publication du 5 octobre 2026

- `make quality-check` : lint, format et types réussis.
- Tests unitaires Docker : 44 réussis dans 7 fichiers.
- `make dev-playwright BUILD=1` : desktop et mobile réussis.
- `make quality-conventions-check` : 14 violations de placement des types déjà
  présentes avant migration ; sortie identique comparée au commit `2bd7cba`.
  Ce contrôle CI reste en échec ; sa correction n’est pas incluse dans la migration.
