---
status: Terminé
source: demande utilisateur — migration du dépôt et nettoyage de l’identité
---

# 042 — Vitrine Showcase et catalogue de démonstration

**Statut** : ✅ fait le 2026-10-05
**Type** : feat
**Tests** : tests de setup local et smoke tests desktop/mobile existants.

## Intention et décisions finales

Migrer vers `johan-Rm/showcase-immobilier-webapp`, remplacer l’identité MLK/BPI
par Showcase Immobilier, conserver le catalogue Blueprint et ses photos comme
démonstration, et rendre le bootstrap local reproductible.

Les fixtures, référentiels et sources YAML sont versionnés. Le setup refuse le
contenu non marqué comme démonstration, conserve `.env` et ne contacte pas l’API.
Les photos originales restent locales dans `public/images/` (ignoré par Git) ;
les photos POC restent versionnées. Les illustrations neutres et le nouveau stamp
SVG/PNG sont conservés. Le contact affiché utilise un domaine de démonstration.

L’historique Git complet est conservé. Sa publication dans le nouveau dépôt est
explicitement demandée par l’utilisateur le 5 octobre 2026.

## Livré

- Identité, logos, favicon, traductions et pages éditoriales Showcase.
- Suppression des anciens destinataires, logos et stamps actifs.
- Catalogue multilingue conservé dans `dev-book/fixtures/catalog/`.
- `scripts/setup-local.ts` et ses tests de rejeu et de protection des données.
- Schémas locaux, génération des contrats et scripts de build autonomes.
- Correctifs SSR du hero différé et du menu tactile privé.
- README et documentation du modèle de contenu et de la sécurité SSR.
- CI déclenchée sur `develop` et `master`.

## Vérification

- Bootstrap complet exécuté dans Docker : données, contrats et préparation Nuxt.
- `.env` conservé à l’identique au rejeu.
- 44 tests unitaires passent dans le conteneur frontend.
- Build SSR et smoke tests desktop/mobile validés pendant la migration.
- L’utilisateur confirme le fonctionnement du vhost SSR local le 4 octobre 2026.
- Gates qualité et tests rejoués avant publication des branches.

## Définition de terminé

- [x] Remote Showcase configuré et historique conservé.
- [x] Identité Showcase et contacts de démonstration.
- [x] Catalogue et photos de démonstration conservés.
- [x] Bootstrap sans identifiants backend.
- [x] Tests et documentation présents dans le commit.

## Hors périmètre

Déploiement VPS et configuration des comptes backend. Les corrections Docker et
médias font l’objet de la tâche 043. Les secrets et médias ignorés ne sont pas publiés.

## Validation avant publication du 5 octobre 2026

- `make quality-check` : lint, format et types réussis.
- Tests unitaires Docker : 44 réussis dans 7 fichiers.
- `make dev-playwright BUILD=1` : desktop et mobile réussis.
- `make quality-conventions-check` : 14 violations de placement des types déjà
  présentes avant migration ; sortie identique comparée au commit `2bd7cba`.
  Ce contrôle CI reste en échec ; sa correction n’est pas incluse dans la migration.
