# `shared/schemas` (Zod)

Ce dossier contient les schémas Zod utilisés pour la validation runtime **côté client et côté serveur**.

## Ajouter un nouveau schéma

1. Créer un fichier dans `shared/schemas/` (ex. `user.ts`).
2. Définir le schéma Zod (`z.object(...)`).
3. Dériver le type TypeScript via `z.infer<typeof mySchema>`.
4. Réexporter dans `shared/schemas/index.ts`.

## Exemple (schéma → type → composable → API)

- Schéma + types : `shared/schemas/echo.ts`
- Usage composable (validation locale + typage) : `app/composables/useEcho.ts`
- Endpoint Nitro (validation runtime + erreurs structurées) : `server/api/echo.post.ts`

## Note bundle

Zod a un coût côté client : importer les schémas dans l’UI seulement si une validation locale est nécessaire.
