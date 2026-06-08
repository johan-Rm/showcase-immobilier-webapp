# Modern Web App Template

Webapp moderne basée sur Nuxt 4, SSR par défaut, multi-langue, orientée SEO, performance, contenu éditorial et déploiement multi-environnements.

## Overview

Le projet suit une gouvernance documentaire et de delivery IA Spec Driven.

Socle technique principal :

- Nuxt 4, Vue 3 et TypeScript strict
- Nuxt UI, Nuxt Content, Nuxt i18n, Pinia
- SSR avec pipeline de génération de schémas au build
- Docker pour les environnements dev, preprod et prod
- synchronisation de contenu depuis une API Symfony

## Setup

Prérequis :

- Bun
- Node.js compatible avec le projet Nuxt
- Docker
- un dossier de schémas YAML accessible via `SCHEMAS_PATH`

Initialisation des environnements :

```bash
cp .env.example .env
cp .env.example .env.preprod
cp .env.example .env.prod