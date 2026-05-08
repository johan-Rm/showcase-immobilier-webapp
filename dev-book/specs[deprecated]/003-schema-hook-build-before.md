# 🎯 Spec : Hook `build:before` Nuxt + génération d’interfaces depuis YAML

## 🔖 Métadonnées

- **ID** : SPEC-003
- **Statut** : En cours (hook et générateur prêts, non branchés au build Nuxt)
- **Décisions structurantes** : À formaliser uniquement si un choix d’architecture devient structurant.
- **Objectif principal** : Générer automatiquement les interfaces TypeScript des schémas YAML avant chaque build Nuxt.

---

## 1. Description rapide

`services/hooks/schema.ts` expose `runSchemaHook` (SCHEMAS = `Article|WebPage|Accommodation`) qui résout le chemin des schémas (option > env `SCHEMAS_PATH`), logue les chemins ignorés et appelle `generateArtifacts`. Le générateur lit les YAML, mappe les types (primitifs, alias, `array<T>`), crée `schemas/interfaces/*.ts` et lève des erreurs explicites. Le hook n’est pas encore inscrit dans `nuxt.config.ts`, donc le build Nuxt ne lance rien.

---

## 2. User Stories (essentielles)

Forme recommandée : _En tant que… Je veux… Afin de…_

- **US1 (Priorité P1)** : En tant que développeur, je veux que le build Nuxt génère automatiquement les interfaces TypeScript à partir des schémas YAML configurés afin d’éviter tout décalage entre modèles et code.
- **US2 (Priorité P1)** : En tant que développeur, je veux que le hook résolve automatiquement le chemin des schémas (option, env, défaut, saisie) afin de limiter les erreurs de configuration.
- **US3 (Priorité P2)** : En tant que équipe CI/CD, je veux que le build échoue explicitement si un schéma attendu est absent ou invalide afin d’empêcher la livraison de builds incohérents.

---

- **CA1** : `runSchemaHook` logue le démarrage, le chemin retenu, la liste des schémas et remonte les erreurs (console.error + rethrow).
- **CA2** : `resolveSchemaPath` exige `process.env.SCHEMAS_PATH`, valide l’accessibilité (dossier lisible) et logue les candidats rejetés.
- **CA3** : `generateArtifacts` lit `schema/{article,web_page,accommodation}.yaml`, parse YAML, mappe les types (primitifs, alias, tableaux) et écrit `schemas/interfaces/{Article,WebPage,Accommodation}.ts` (création du dossier si besoin).
- **CA4** : Aucun wiring Nuxt : le hook n’est pas référencé dans `nuxt.config.ts`, et aucune option de chemin n’est transmise.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Les schémas YAML contiennent au minimum nom d’entité et propriétés typées pour générer les interfaces.
- HYP-002 : Le chemin est fourni via option, env ou défaut (pas de prompt interactif).

### Contraintes techniques (TECH)

- TECH-001 : Le hook (`services/hooks/schema.ts`) ne contient que l’orchestration (logs, SCHEMAS fixes, appel service).
- TECH-002 : Le resolver de chemin (`services/infra/resolver/schema/path.ts`) s’appuie sur des helpers partagés (`shared/node/fs.ts`) et échoue sans prompt si aucun chemin valide n’est trouvé.
- TECH-003 : Les erreurs (chemin introuvable, YAML manquant/invalide, écriture impossible) doivent lever une exception et bloquer le build.
- TECH-004 : Les interfaces générées doivent être identiques à contenu YAML identique (idempotence).

---

## 5. Plan d’implémentation (ultra-synthétique)

Décrire comment on s’y prend, sans entrer dans trop de détails.

- Ajouter le hook `build:before` dans `nuxt.config.ts` en déléguant à `services/hooks/schema.ts`.
- Implémenter le resolver `services/infra/resolver/schema/path.ts` (exige `SCHEMAS_PATH`, sans prompt) en s’appuyant sur `shared/node/fs.ts`.
- Définir `SCHEMAS = ['Article', 'WebPage', 'Accommodation'] as const` dans le hook.
- Appeler `services/converter/schema/generateArtifacts.ts` qui gère validation des YAML, mapping des types, génération et écriture des interfaces.
- Couvrir les cas d’erreur bloquants (chemin manquant, YAML absent, parsing invalide, écriture impossible).

---

- [ ] **T1 – Hook** : Ajouter le hook `build:before` dans `nuxt.config.ts` avec résolution du chemin + logs (délégué à `services/hooks/schema.ts`).
- [x] **T2 – Constantes** : Définir `SCHEMAS` (liste fixe) dans le hook.
- [x] **T3 – Appel service** : Appeler `generateArtifacts(schemaPath, SCHEMAS)` et propager/logger les erreurs.
- [x] **T4 – Service** : Implémenter/compléter `services/converter/schema/generateArtifacts.ts` (validation chemin, charge YAML, parse, génère interfaces, écrit fichiers, lève exceptions explicites).
- [ ] **T5 – Tests / Vérifs** : Couvrir les cas de succès et d’erreurs bloquantes, vérifier l’idempotence.
- [ ] **T6 – Docs** : Mettre à jour la doc/README et `.env.example` si nécessaire (variable `SCHEMAS_PATH`).

---

## 7. Notes / Risques

- RISK-001 : Build bloquant si aucun chemin n’est fourni (pas de prompt) ; exiger `SCHEMAS_PATH` ou une option dans les environnements non interactifs/CI.
- RISK-002 : Les schémas YAML incomplets ou divergents peuvent générer des interfaces incorrectes ; la validation doit être stricte et explicite.
- RISK-003 : Écriture concurrente/parallel build pourrait générer des conflits ; s’assurer que le dossier de sortie est stable ou nettoyé avant génération.

> Formaliser une note de décision dédiée si un choix devient structurant ou critique.
