---
status: À faire
dependances: []
---

# 018 — Migration du champ `level` : boolean → number

## Intention

Le champ `level` représente le niveau (nombre d'étages ou floor) d'un bien immobilier.
Il est défini comme `number` dans `schemas/webapp/accommodation.yaml` et dans le contrat
TS généré `schemas/interfaces/accommodation.ts`.

En pratique, le contenu Markdown stocke `level: true` ou `level: false` (boolean hérité
de l'entité PHP `?bool`) et le dashboard editor utilise `default: false`.

Cette tâche aligne le contenu existant et le dashboard sur le contrat YAML déclaré.

## Problèmes à corriger

### 1. Contenu Markdown — valeurs boolean à migrer

Fichiers concernés (valeur `level: true` à convertir en entier) :

```
content/fr/accommodations/appartement-atelier-medina.md    → level: true
content/fr/accommodations/affaire-commerciale-cafe-medina.md → level: true
content/fr/accommodations/affaire-commerciale-boutique-centre.md → level: true
```

Règle de migration :
- `level: true` → `level: 1` (bien avec étage(s))
- `level: false` → supprimer le champ ou `level: 0` (plain-pied)

Vérifier s'il existe d'autres fichiers avec `level:` dans les deux dossiers de locales.

### 2. Dashboard editor — valeur par défaut

Dans `app/components/dashboard/PropertyContentEditor.vue` (ligne 243) :

```ts
// avant
{ key: 'level', label: f('level', 'De plain-pied'), default: false, half: true }

// après
{ key: 'level', label: f('level', 'De plain-pied'), default: 0, half: true }
```

Vérifier que le composant d'édition associé à ce champ gère bien un type `number`
(input numérique plutôt que toggle boolean).

### 3. Vérifier le mapper

Dans `services/mapper/accommodation.ts`, le champ `level` est repris tel quel
depuis le record source (`...item`). Vérifier qu'aucun cast explicite vers boolean
n'est présent dans les composants de rendu public.

## Validation

```bash
bun run type-check
bun run lint:check
```

- Aucun fichier Markdown ne contient `level: true` ou `level: false`
- Le dashboard editor utilise bien un input numérique pour `level`
- Le type-check passe sans erreur sur `level`

## Hors périmètre

- Correction de l'entité PHP `Accommodation::level` → voir TASK-API-015
- Correction du DTO `schemas/dtos/symfony_api/accommodation.yaml` → voir TASK-DGDOC-001
