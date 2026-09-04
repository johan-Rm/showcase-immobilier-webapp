---
status: Todo
dependances: [039]
doc: docs/3.application/audit-lighthouse.md
---

# 040 — Audit Lighthouse de production chaque nuit dans le CI

- **Créée le** : 2026-09-03.
- **Session** : `a8a76664-2998-4f4a-a048-2030d9f370b8`.
- **Statut** : ⏳ à faire.
- **Type** : chore — CI.
- **Tests** : `sans objet — fichier de workflow ; la preuve attendue est un déclenchement manuel du
job produisant les scores, la pièce jointe et la ligne d'historique, sortie lue.`
- **Réf** : amont → **carte 039** (le script doit trouver Chrome sur un coureur GitHub avant que ce
  job puisse l'appeler) · `.github/workflows/sonarqube.yml` (modèle : variables de dépôt) ·
  `docs/3.application/audit-lighthouse.md`.

## Contexte

Le CI de ce dépôt ne mesure aujourd'hui **aucune performance**. Les trois workflows existants
relisent le code sans jamais démarrer l'application :

- `quality.yml` — lint, format, vérification des types ;
- `conventions.yml` — les huit scripts de conventions maison ;
- `sonarqube.yml` — analyse Sonar Cloud.

Aucun ne lance Vitest ni Playwright. Il n'existe donc **aucun modèle de job qui démarre l'app** à
copier dans ce dépôt : ce serait le premier.

Or démarrer l'app dans le CI n'est pas anodin ici. Le hook `build:before` de `nuxt.config.ts:213`
appelle `runSchemaHook`, qui exige `SCHEMAS_PATH` — un dossier **situé hors de ce dépôt**, dans le
mono-repo parent. Un workflow qui ne récupère que ce dépôt-ci ne peut pas construire l'application
sans un accès inter-dépôts ou un instantané des schémas commité.

Conséquence : le site public part en ligne sans qu'aucune mesure ne suive sa performance dans le
temps. Une régression — une image mal dimensionnée, un script ajouté, une police qui bloque le
rendu — ne se voit qu'à l'œil, en production, une fois que les visiteurs la subissent.

## Périmètre

- **Un workflow** `.github/workflows/lighthouse.yml`, déclenché par `schedule` (une fois par nuit)
  et par `workflow_dispatch` (bouton manuel).
- **Cible : la production**, page d'accueil `/fr`. L'URL est lue dans une **variable de dépôt**
  (ex. `vars.LIGHTHOUSE_URL`), sur le modèle de `sonarqube.yml` qui lit déjà `vars.SONAR_ORGANIZATION`.
  Variable absente → le job s'arrête avec un message explicite, il ne devine pas d'URL.
- **Moteur : le script du dépôt**, `scripts/lighthouse-mobile-4g.sh`, appelé avec l'URL en argument.
- **Jamais bloquant** — aucun seuil, le job ne fait pas échouer quoi que ce soit sur un mauvais
  score. Il n'échoue que si l'audit lui-même n'a pas pu se faire (site injoignable, rapport
  invalide, variable manquante).
- **Restitution en trois formes** :
  - les quatre scores écrits dans le résumé du job (`$GITHUB_STEP_SUMMARY`), lisibles sans rien
    ouvrir ;
  - le rapport JSON complet joint en pièce téléchargeable ;
  - une ligne ajoutée à un fichier d'historique suivi en versions, puis poussée.
- **Le fichier d'historique** — chemin, format d'une ligne (au minimum : date, URL auditée, les
  quatre scores) et branche cible à arrêter à l'implémentation. Son nom **ne doit pas** commencer
  par `lighthouse-` tant que le correctif de `.gitignore` de la carte 039 n'est pas en place.
- **Documentation** — compléter `docs/3.application/audit-lighthouse.md` (créée par la carte 039)
  d'une section sur le job : quand il tourne, ce qu'il produit, où lire l'historique, quelle
  variable poser.

## Hors périmètre

- **Les seuils bloquants.** Décision assumée : on observe d'abord la dispersion réelle des scores
  sur plusieurs semaines. Fixer un seuil aujourd'hui reviendrait à le choisir à l'aveugle, et le
  premier faux échec ferait désactiver le job. Une carte ultérieure les posera sur données.
- **L'audit de la preprod.** Un seul environnement pour commencer.
- **Les autres pages** (liste d'annonces, fiche de bien, contact) et les autres langues. L'accueil
  seul : c'est la page la plus lourde du site, avec ses écrans plein viewport.
- **Le déclenchement sur Pull Request.** Écarté avec le build dans le CI, dont il dépendrait.
- **Le build de l'application dans le CI**, et donc la question de `SCHEMAS_PATH` en CI. C'est
  précisément ce que le choix « auditer un environnement déployé » permet d'éviter.
- **Un service externe de suivi de performance.** Le fichier d'historique suffit à la tendance.
- **Faire tourner Vitest ou Playwright dans le CI.** Manque réel, constaté en cadrant celle-ci,
  mais sans rapport : il lui faut sa propre carte.

## Décisions de cadrage

- **Production plutôt que preprod.** On mesure ce que les visiteurs subissent réellement, avec le
  vrai hébergement, le vrai cache et la vraie latence réseau. Le prix assumé : la régression est
  constatée après mise en ligne, pas avant. C'est acceptable parce que le job n'est pas une barrière
  de qualité mais un capteur de tendance.
- **Nuit plutôt qu'à chaque Pull Request.** Les scores Lighthouse varient d'une exécution à l'autre
  sur des machines partagées ; une mesure par PR produirait du bruit qu'on apprendrait vite à
  ignorer. Une mesure quotidienne au même horaire donne une série comparable.
- **Le script du dépôt plutôt qu'une action toute faite.** Les réglages de bridage réseau restent
  écrits **à un seul endroit** : le local et le CI mesurent exactement la même chose. Une action
  externe obligerait à les recopier, et les deux copies divergeraient un jour sans que rien ne le
  signale.
- **Informatif d'abord.** Voir _Hors périmètre_.
- **Exception assumée à la règle « aucun commit direct sur la branche d'intégration ».** Le job
  pousse une ligne d'historique, ce que le socle de gouvernance interdit — cette règle protège la
  relecture systématique et la traçabilité de qui écrit quoi. L'exception est **délimitée par
  construction** : le job ne peut modifier **que** le fichier d'historique, une ligne ajoutée en
  fin de fichier, jamais rien d'autre. L'implémentation doit rendre cette limite mécanique (chemin
  unique explicitement mis en index), pas seulement intentionnelle. L'alternative écartée était de
  conserver les rapports en pièces jointes longue durée, sans écriture dans le dépôt.

## Règles et cas limites

- **Le job ne doit jamais bloquer une Pull Request.** Il ne se déclenche ni sur `pull_request`, ni
  sur `push` — uniquement `schedule` et `workflow_dispatch`.
- **Site injoignable la nuit.** Le script sort déjà en échec proprement si l'URL ne répond pas. Le
  job doit alors échouer **visiblement** (c'est une information réelle sur la production) sans
  écrire de ligne d'historique ni pousser quoi que ce soit.
- **Rapport invalide.** `validate_report` supprime le rapport et sort en échec quand Chrome a
  chargé une page d'erreur. Aucune ligne d'historique ne doit être écrite dans ce cas — un score
  mesuré sur une page d'erreur pollue la série pour toujours.
- **Deux exécutions rapprochées** (la nuit et un lancement manuel) ne doivent pas se marcher dessus
  au moment de pousser l'historique : prévoir le cas où la branche a bougé entre la lecture et
  l'écriture.
- **Droits d'écriture.** Le job a besoin d'une permission d'écriture sur le contenu du dépôt. La
  restreindre au strict nécessaire, pas de permission large par défaut.
- **`lighthouse` n'est pas figé en version** : `npx` télécharge la dernière disponible. Un saut de
  version majeure peut décaler les scores sans qu'une ligne de code ait changé. À signaler dans la
  documentation ; le figer est une décision à part.
- **Le fuseau horaire de `schedule` est UTC.** Choisir l'heure en conséquence, et la documenter.

## Documentation impactée

- `docs/3.application/audit-lighthouse.md` — section sur le job CI, la variable de dépôt à poser,
  l'emplacement et le format de l'historique, et l'avertissement sur la version de Lighthouse.
- `docs/3.application/index.md` — si l'index liste les workflows.

## Définition de terminé

- [ ] Un déclenchement manuel du workflow aboutit et affiche les quatre scores dans le résumé du
      job — sortie lue.
- [ ] Le rapport JSON est présent en pièce téléchargeable sur cette exécution.
- [ ] Une ligne a été ajoutée au fichier d'historique et poussée ; le commit ne touche que ce
      fichier — `git show --stat` lu.
- [ ] Variable de dépôt absente → le job s'arrête avec un message qui nomme la variable manquante.
- [ ] URL injoignable → le job échoue, et **aucune** ligne d'historique n'est écrite.
- [ ] Le workflow ne se déclenche ni sur `pull_request` ni sur `push` — vérifié sur une PR ouverte.
- [ ] La section de documentation est écrite et référence la variable et l'historique.

## Inconnues à lever à l'implémentation

- **L'URL de production exacte** — introuvable dans le dépôt (aucun `server_name` public, aucune
  URL dans les runbooks). À poser en variable de dépôt GitHub.
- **La branche que le job met à jour** avec l'historique, et le chemin du fichier.
- **L'heure du déclenchement nocturne**, en UTC.
