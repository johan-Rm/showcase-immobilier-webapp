---
status: Todo
dependances: []
doc: docs/3.application/audit-lighthouse.md
---

# 039 — Fiabiliser le script d'audit Lighthouse mobile

- **Créée le** : 2026-09-03.
- **Session** : `a8a76664-2998-4f4a-a048-2030d9f370b8`.
- **Statut** : ⏳ à faire.
- **Type** : chore — outillage.
- **Tests** : `sans objet — script bash et configuration ; la preuve attendue est une exécution
réelle du script sur un SSR local, sortie lue.`
- **Réf** : aval → carte 040 (job CI nocturne, qui appelle ce script) · `scripts/lighthouse-mobile-4g.sh` ·
  `docs/3.application/sonarqube-cloud.md` (modèle de page de doc) · `.gitignore` · `Dockerfile`.

## Contexte

Le script `scripts/lighthouse-mobile-4g.sh` existe depuis août 2026 (commit `8f17bd8`). Sa
mécanique est saine : il vérifie ses prérequis avant de démarrer, teste que l'URL répond avant de
lancer Chrome, utilise un port de débogage aléatoire et un profil jetable, et **valide le rapport
après coup** — si Chrome a chargé une page d'erreur au lieu du site, il supprime le rapport et sort
en échec. C'est exactement le piège classique d'un audit Lighthouse, et il est couvert.

Mais il n'est appelé de nulle part : aucune cible `make`, aucune entrée `package.json`, aucune
mention dans la documentation ni dans les runbooks. Personne ne le lance, et aucune mesure de
performance n'est produite par le projet.

Quatre défauts constatés le 2026-09-03 l'empêchent de servir tel quel :

1. **L'URL par défaut est morte.** Le script vise `http://localhost:3001/fr`. Ce port ne sert plus
   rien : `webapp-localhost` écoute sur 3000, `webapp-ssr` n'a **aucune** section `ports:` et n'est
   joignable que via nginx sur `${PUBLIC_PORT:-8080}` (`.env` : `PUBLIC_PORT=8080`,
   `SITE_URL=http://webapp.localhost:8080`). Le 3001 vient de `Dockerfile:26` (`PUBLIC_PORT=3001`),
   valeur interne à l'image qui n'a jamais été exposée. Le message d'erreur aggrave le cas : il
   recommande `make dev-webapp-ssr BUILD=1`, commande qui n'ouvrira jamais le 3001.

2. **Chrome n'est cherché qu'au seul endroit où il n'est pas.** La détection se limite à
   `~/.cache/ms-playwright`. Or ce projet fait tourner Playwright **dans Docker** : ce dossier
   n'existe pas sur la machine de développement, et n'existe pas non plus sur un coureur GitHub —
   qui, lui, a un Chrome système préinstallé.

3. **Trois des cinq options de bridage réseau sont probablement inertes.**
   `--throttling.rttMs` et `--throttling.throughputKbps` servent le mode `simulate` (le défaut de
   Lighthouse) ; `--throttling.requestLatencyMs`, `--throttling.downloadThroughputKbps` et
   `--throttling.uploadThroughputKbps` servent le mode `devtools`. Comme `--throttling-method`
   n'est pas précisé, les trois dernières seraient ignorées. **Non vérifié sur un rapport réel** :
   c'est une déduction du fonctionnement documenté de Lighthouse.

4. **Le `.gitignore` avale les noms qui commencent par `lighthouse-`.** La ligne 49 pose
   `lighthouse-*` **sans barre oblique de tête** : en Git, ça ignore ces fichiers **à n'importe
   quelle profondeur**, pas seulement à la racine. Seul `!scripts/lighthouse-*.sh` y échappe. Une
   page `docs/3.application/lighthouse-ci.md` ou un fichier d'historique `lighthouse-history.md`
   seraient donc **silencieusement non versionnés**, sans le moindre message.

## Périmètre

- **URL par défaut** — remplacer `http://localhost:3001/fr` par l'adresse réellement servie en
  local, et corriger le message d'erreur pour qu'il nomme la commande qui ouvre bien cette adresse.
- **Détection de Chrome** — conserver la recherche dans le cache Playwright, y ajouter un repli
  ordonné : `$CHROME_PATH` explicite, puis les binaires système (`google-chrome`,
  `google-chrome-stable`, `chromium`, `chromium-browser`). Message d'erreur mis à jour en
  conséquence.
- **Mode de bridage** — lancer un audit réel, lire dans le rapport quel mode a servi, puis
  trancher : soit retirer les trois options inertes, soit ajouter `--throttling-method=devtools`.
  La décision et sa preuve s'écrivent dans la page de documentation.
- **Point d'entrée nommé** — une cible `make` déclarée dans l'aide du `Makefile`, et l'entrée
  `package.json` correspondante.
- **`.gitignore`** — ancrer le motif à la racine (`/lighthouse-*`), ce qu'il voulait dire puisqu'il
  visait les rapports générés. L'exception `!scripts/lighthouse-*.sh` devient alors inutile.
- **Documentation** — créer `docs/3.application/audit-lighthouse.md` sur le modèle de
  `sonarqube-cloud.md` : à quoi sert l'audit, comment le lancer en local, quels prérequis, comment
  lire les quatre scores.

## Hors périmètre

- Le workflow GitHub Actions et tout ce qui touche au CI — **carte 040**.
- Les seuils de score, bloquants ou non — carte 040 les écarte explicitement aussi.
- Toute optimisation réelle de performance sur le site. Cette carte fabrique l'instrument de
  mesure ; elle ne corrige rien de ce qu'il mesurera.
- L'audit d'autres pages que celle passée en argument. Le script prend déjà une URL en paramètre,
  rien à changer.
- Ajouter `lighthouse` aux dépendances du projet : `npx` le récupère à la volée, et le figer est
  une décision qui appartient à la carte 040 (reproductibilité des scores dans le temps).

## Décisions de cadrage

- **Ancrer le motif `.gitignore` plutôt que renommer les fichiers.** Renommer contournerait le
  problème pour deux fichiers en le laissant intact pour les suivants. Le motif non ancré est le
  défaut réel : il rend tout fichier commençant par `lighthouse-` non versionnable partout dans le
  dépôt, en silence. Un correctif d'une ligne vaut mieux qu'une contrainte de nommage à retenir.
- **La page de doc s'appelle `audit-lighthouse.md`, pas `lighthouse-ci.md`.** Elle couvre l'usage
  local **et** le job CI de la carte 040 — « audit » décrit mieux les deux que « ci ». Le nom évite
  aussi le motif ci-dessus, ce qui laisse une marge si le correctif de `.gitignore` était un jour
  défait.
- **Le repli sur le Chrome système est un préalable au CI, pas un confort.** Un coureur GitHub n'a
  pas le cache Playwright. Sans ce point, la carte 040 ne peut pas réutiliser le script — c'est ce
  qui impose l'ordre 039 puis 040.
- **Le mode de bridage se tranche sur preuve, pas sur raisonnement.** Le constat 3 est une
  déduction ; la corriger à l'aveugle risquerait de changer les valeurs mesurées sans qu'on sache
  dans quel sens. Un rapport réel d'abord.

## Règles et cas limites

- **Ne pas casser l'appel avec argument.** `./scripts/lighthouse-mobile-4g.sh <url> [sortie]` doit
  continuer de fonctionner à l'identique : c'est cette forme que la carte 040 utilisera.
- **`jq` reste un prérequis** et le script doit continuer à le dire clairement. Il n'est installé
  ni sur la machine de développement, ni forcément ailleurs.
- **La validation du rapport ne se touche pas.** `validate_report` et le rejet des pages d'erreur
  Chrome sont la partie la plus utile du script ; le diff ne doit pas les affaiblir.
- **Le nettoyage doit survivre au repli système.** Le `trap cleanup EXIT` tue le processus Chrome
  et supprime le profil : vérifier qu'un Chrome système lancé de la même manière est bien nettoyé.
- **Les valeurs `rttMs=40` / `throughputKbps=10240` correspondent au préréglage « Fast 4G » officiel
  de Lighthouse.** Elles ne changent pas, quelle que soit la décision sur le mode.

## Documentation impactée

- `docs/3.application/audit-lighthouse.md` — **créée** par cette carte.
- `docs/3.application/index.md` — y référencer la nouvelle page si l'index liste les pages.
- L'aide du `Makefile` — la nouvelle cible apparaît dans `make help`.

## Définition de terminé

- [ ] `./scripts/lighthouse-mobile-4g.sh` sans argument aboutit sur un SSR local démarré, et le
      rapport produit porte bien l'URL du site (pas une page d'erreur Chrome).
- [ ] Le script trouve Chrome sur cette machine, qui n'a pas de cache Playwright — sortie lue.
- [ ] Le mode de bridage est tranché, la preuve (extrait du rapport nommant le mode actif) est
      citée dans la page de documentation.
- [ ] La cible `make` apparaît dans `make help` et lance bien l'audit.
- [ ] `/lighthouse-*` ancré dans `.gitignore` ; `git check-ignore -v docs/3.application/audit-lighthouse.md`
      ne renvoie plus rien.
- [ ] `docs/3.application/audit-lighthouse.md` existe et est suivie en versions.
