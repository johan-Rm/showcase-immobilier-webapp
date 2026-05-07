# Spec : Correction lint locale du logger

## Metadonnees

- ID : SPEC-022
- Statut : Termine
- Objectif principal : supprimer l erreur ESLint residuelle dans `useLogger` sans regression fonctionnelle

---

## Description rapide

Le repository reste bloque par une erreur `no-console` dans `app/composables/useLogger.ts`.

Le besoin est de corriger ce point de maniere locale et lisible afin de retrouver un socle de quality gates vert, sans elargir le scope a un refactor transverse.

---

## Perimetre

Dans le scope de cette spec :

- corriger l usage du sink console dans `app/composables/useLogger.ts`
- conserver le comportement du logger cote client
- revalider `bun run lint:check`, `bun run format:check` et `bun run type-check`

Hors scope :

- refonte du logger
- changement de contrat public du composable
- modification des regles ESLint

---

## Contraintes

- diff minimal et intentionnel
- pas de desactivation de regle opportuniste
- rester SSR-safe
- ne pas degrader les niveaux de logs exposes par le composable

---

## Criteres d acceptation

- `bun run lint:check` passe
- `bun run format:check` passe
- `bun run type-check` passe
- `useLogger` conserve ses methodes publiques et son comportement attendu cote client

---

## Plan d execution utile

1. corriger localement le sink de sortie du logger
2. verifier le composable apres correction
3. relancer les quality gates applicables
