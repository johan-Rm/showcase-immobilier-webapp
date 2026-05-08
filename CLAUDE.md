# CLAUDE — Gouvernance IA locale

Ce fichier définit le cadre de travail global pour Claude Code.

Il adapte les règles du socle partagé `~/.agents` au fonctionnement de Claude, sans
reprendre les fichiers runtime propres à Codex.

## Hiérarchie normative

En cas de conflit, appliquer l'ordre suivant :

1. constitution locale du projet si elle existe
2. `CLAUDE.md` local du projet si il existe
3. `AGENTS.md` local du projet si il existe
4. `~/CONSTITUTION.md`
5. ce fichier `~/.agents/CLAUDE.md`
6. README locaux et documentation du périmètre concerné
7. instructions ponctuelles de tâche

Les instructions système de Claude restent évidemment prioritaires sur ce fichier.

## Ordre de lecture minimal

Avant d'agir, lire uniquement les sources utiles au périmètre, dans cet ordre :

1. fichier de gouvernance local du projet : `CLAUDE.md`, `AGENTS.md` ou équivalent
2. constitution locale du projet si elle existe
3. `~/CONSTITUTION.md`
4. documentation d'architecture pertinente, par exemple `docs/2.architecture/`
5. README du périmètre concerné
6. tasks ou documents fonctionnels directement liés à la demande

Ne pas charger toute la documentation sans nécessité. Si un fichier attendu est absent,
poursuivre avec les sources disponibles et expliciter seulement les hypothèses qui
influencent le résultat.

## Mission de travail

Produire des changements simples, lisibles, maintenables et vérifiables.

Priorités constantes :

1. clarté pour l'utilisateur final
2. lisibilité du contenu et du code
3. performance et sobriété
4. sécurité et absence de secrets
5. maintenabilité du delivery

## Contraintes transverses

- mobile-first pour les interfaces web
- SSR-safe par défaut sur Nuxt, Vue et frameworks équivalents
- SEO by design lorsque le contenu est public
- accessibilité clavier, labels, alt et focus lorsque l'UI est touchée
- pas de sur-ingénierie sans bénéfice utilisateur clair
- pas de refactor hors périmètre explicite
- pas de dépendance ajoutée sans justification
- pas de secret en clair, pas de `.env` committé
- pas de `console.log` en production
- diff minimal et intentionnel

## Principes d'ingénierie

Appliquer explicitement :

- Clean Code pour la lisibilité, le nommage et la cohérence
- SOLID pour protéger responsabilités, contrats et couplage
- KISS pour privilégier la solution robuste la plus simple
- YAGNI pour éviter abstraction et complexité prématurées
- Separation of Concerns entre UI, orchestration, métier, données et infrastructure
- Design Patterns uniquement lorsqu'ils simplifient réellement le code

## Profils de travail

### `default`

Profil généraliste de delivery.

À utiliser pour :

- demandes mixtes ou incomplètement cadrées
- petites corrections locales
- coordination, analyse transverse ou cadrage initial

Responsabilités :

- comprendre le besoin réel
- limiter le scope
- choisir le bon niveau de lecture
- livrer une V1 exploitable et sobre

### `nuxt`

Profil frontend Nuxt, Vue et TypeScript strict.

À utiliser pour :

- pages, layouts, screens, composants, composables et stores
- architecture UI
- SSR, SEO, performance frontend et hydratation

Règles :

- `pages/` orchestre
- `components/` affiche
- la logique métier reste hors UI
- les appels API passent par la bonne couche de service ou composable
- préserver le typage explicite, sans `any` non justifié
- utiliser les primitives framework adaptées

Points de vigilance :

- hydratation serveur/client
- poids JS et images
- accessibilité
- indexabilité et structure sémantique

### `review`

Profil de relecture technique.

À utiliser pour :

- audit de diff, fichier, PR ou architecture
- recherche de bugs, régressions et écarts de conventions

Format attendu :

1. findings ordonnés par sévérité
2. questions ouvertes ou hypothèses
3. résumé bref seulement en dernier

Règles :

- citer fichiers et lignes quand c'est possible
- distinguer défaut avéré, risque plausible et préférence de style
- si aucun finding n'est trouvé, le dire explicitement

### `github`

Profil contribution et workflow GitHub.

À utiliser pour :

- commits, branches, PR, checks CI, stratégie de merge
- préparation d'une contribution facile à relire

Règles :

- aucun commit direct sur `main` ou `develop`
- scope de contribution maîtrisé
- vérifier lint, format, type-check et tests pertinents avant PR lorsque disponibles

## Skills partagées

Les skills communes sont disponibles via :

```txt
~/.claude/skills -> dossiers liés vers ~/.agents/skills
```

Utiliser une skill quand la tâche correspond clairement à son périmètre. Ne pas forcer une
skill si une réponse directe ou une petite correction locale suffit.

## Commandes partagées

Les commandes Claude partagées sont disponibles via :

```txt
~/.claude/commands -> ~/.agents/commands
```

Elles doivent rester génériques, non sensibles et utilisables sur plusieurs projets.

## Fichiers à ne jamais partager

Ne pas versionner, copier ni symlinker vers le socle partagé :

- `.credentials.json`
- `auth.json`
- `config.toml`
- `.env`
- `sessions/`
- `projects/`
- `file-history/`
- `session-env/`
- `cache/`
- `telemetry/`
- `shell-snapshots/`
- `logs/`
- `*.sqlite`
- `*.jsonl`

## Mode d'exécution

- lire le contexte utile avant d'agir
- faire le diff le plus local possible
- préserver les changements utilisateur existants
- ne jamais supprimer ou réinitialiser du travail sans demande explicite
- mettre à jour la documentation impactée dans le même scope
- exécuter les vérifications pertinentes lorsque c'est raisonnable
- mentionner explicitement les risques sécurité, performance, accessibilité ou contrat
  quand ils sont touchés
