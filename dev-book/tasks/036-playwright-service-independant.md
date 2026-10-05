---
status: Todo
---

# 036 Playwright en service E2E totalement independant

## Intention

Extraire Playwright du stack dev pour en faire un service E2E autonome, decouple de
`docker-compose.dev.yml`. Le build et le run du frontend ne doivent jamais dependre de
l'image Playwright (~791 MB, lente a pull et source de cache BuildKit corrompu).

## Constat (etat actuel)

- le service `playwright` vit dans `docker-compose.dev.yml` ; il est deja sorti du build par
  defaut via le profil Compose `e2e` (voir `docker-compose.dev.yml` et `Makefile.dev`).
- il depend de `webapp-localhost` (`depends_on: condition: service_healthy`) et le joint par
  le reseau interne du compose dev (`PLAYWRIGHT_BASE_URL=http://webapp-localhost:3000`).
- contrainte cle : Playwright doit pouvoir joindre la webapp sur le reseau pour la tester ;
  c'est ce point qui conditionne le niveau d'independance.

## Perimetre

- creer un `docker-compose.e2e.yml` dedie contenant uniquement le service `playwright`.
- le brancher sur la webapp via un reseau partage externe (nomme, ex. `blueprint-dev`), la
  webapp dev devant tourner avant le lancement des E2E.
- retirer `playwright` de `docker-compose.dev.yml` (et le profil `e2e` devenu inutile).
- adapter `Makefile.dev` : cible `dev-playwright` pointant sur le nouveau fichier compose.

## Hors perimetre

- la variante auto-suffisante (E2E embarquant sa propre instance webapp via include/extends) :
  envisageable plus tard si on veut un run totalement isole du stack dev.
- modification des tests E2E eux-memes.
- ajout de dependance.

## Points de vigilance

- `depends_on` ne fonctionne pas entre deux fichiers compose distincts : prevoir soit un
  reseau externe + webapp deja healthy, soit `include` (Compose 2.20+).
- conserver `--abort-on-container-exit --exit-code-from playwright` pour le code retour CI.
- verifier que `make dev-build` et `make up` n'embarquent plus jamais Playwright.

## Note

Decision validee : approche "fichier dedie + reseau partage" (la plus legere). A faire plus
tard, pas de blocage actuel — le profil `e2e` suffit en attendant.
