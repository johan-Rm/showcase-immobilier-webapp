### 📘 Rôle du dossier

> Ce dossier centralise les procédures opérationnelles exceptionnelles (one-shot, maintenance, migrations manuelles, recovery) à exécuter de manière contrôlée, traçable et reproductible sur les environnements.

Constitution du projet : `.codex/constitution.md`.

---

### ⚡Convention de nommage

```
YYYY-MM-DD-action-cible.md
```

**Exemples :**

```
2026-01-15-migrate-users-table.md
2026-01-18-backfill-orders-status.md
2026-02-01-purge-legacy-accounts.md
2026-02-10-reindex-search-engine.md
```

**Règle :**

- Date = ordre chronologique naturel
- Action = verbe explicite (migrate, backfill, purge, reindex, cleanup…)
- Cible = système ou donnée concernée

---

### 🔗 Association avec les commits Git

Chaque runbook est lié à un ou plusieurs commits ayant introduit la nécessité de l’opération.

**Règle :**

> Tout changement nécessitant une action exceptionnelle doit référencer son runbook, et tout runbook doit référencer le commit associé.

**Exemple de commit :**

```
chore(db): add legacy users index

[runbook: 2026-01-15-migrate-users-table]
```

**Exemple dans le runbook :**

```
Commit : a4f92c1 — chore(db): add legacy users index
```
