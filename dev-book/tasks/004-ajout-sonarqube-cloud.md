---
status: In progress
doc: docs/3.application/sonarqube-cloud.md
---

# 004 Ajout SonarQube Cloud

## Intention

Ajouter une analyse SonarQube Cloud en CI pour couvrir la qualite generale du code sans
remplacer les conventions projet declarees en YAML.

## Perimetre

- ajouter `sonar-project.properties`
- ajouter un workflow GitHub Actions dedie
- documenter les variables et secrets GitHub necessaires
- garder SonarQube separe des checks de conventions projet

## Hors perimetre

- installer SonarQube Server en Docker
- ajouter une dependance npm de scanner
- creer le projet SonarQube Cloud a la place du proprietaire du depot
- definir des quality gates personnalises

## Criteres d acceptation

- le workflow utilise l action officielle `SonarSource/sonarqube-scan-action`
- la configuration ne contient aucun token en clair
- `sonar-project.properties` exclut les dossiers generes et dependances
- la documentation indique les variables GitHub requises

## Points de vigilance

- Le scan echouera tant que `SONAR_TOKEN`, `SONAR_ORGANIZATION` et `SONAR_PROJECT_KEY`
  ne sont pas configures dans GitHub.
- La quality gate SonarQube doit rester complementaire a `lint`, `type-check` et
  `scripts/ci/app`.
