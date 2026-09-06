# Workflow IA dans VSCode

- Rôle : décrire comment les assistants IA (Claude Code et Codex) travaillent dans VSCode sur ce projet : quelle gouvernance ils lisent, dans quel ordre, et comment ils livrent.
- Related : [../index.md](../index.md), [../2.architecture/index.md](../2.architecture/index.md)

## Assistants en place

Deux assistants IA interviennent depuis VSCode. Chacun lit son propre fichier de gouvernance,
résolu en cascade du plus global au plus local. Le fichier local du projet a toujours la
priorité la plus haute.

| Assistant   | Fichier de gouvernance | Cascade (global → local)                                                                 |
| ----------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| Claude Code | `CLAUDE.md`            | `~/.claude/CLAUDE.md` → `graines-digitales/CLAUDE.md` → `blueprint-immobilier/CLAUDE.md` |
| Codex       | `AGENTS.md`            | `~/.agents/AGENTS.md` → `graines-digitales/AGENTS.md` → `blueprint-immobilier/AGENTS.md` |

Le runtime Codex propre au projet est isolé dans `.codex/` (qui renvoie au socle global).
Les extensions VSCode attendues côté éditeur sont déclarées dans `.vscode/extensions.json`
(Volar, ESLint, Prettier) : elles garantissent que le formatage et le lint vus par l'humain
et par l'IA sont identiques.

## Routage par nature de demande

L'assistant qualifie d'abord la demande, puis lit la source qui en est propriétaire :

| Nature de la demande                             | Source à lire                                     |
| ------------------------------------------------ | ------------------------------------------------- |
| Architecture ou structure                        | `docs/2.architecture/`                            |
| Convention transverse par thème                  | `docs/`                                           |
| Règle opérationnelle d'un dossier                | `README.md` du dossier (co-localisé avec le code) |
| Feature ou correction formalisée                 | `dev-book/tasks/`                                 |
| Opération exceptionnelle / maintenance contrôlée | `dev-book/runbooks/`                              |
| Intention locale d'un bloc complexe              | commentaire dans le code                          |

## Ordre de lecture

L'assistant part du contexte le plus proche du changement et ne remonte vers une règle
globale que si nécessaire. Il ne charge jamais toute la documentation par défaut.

1. Le fichier de gouvernance de l'assistant utilisé (`CLAUDE.md` pour Claude Code,
   `AGENTS.md` pour Codex).
2. Les seuls fichiers `docs/2.architecture/` liés au périmètre modifié.
3. La section `docs/` thématique si une convention transverse est concernée.
4. Le `README.md` local du dossier modifié.
5. La tâche `dev-book/tasks/` correspondante si le changement est formalisé.

Les sources `docs/` utilisent un `index.md` comme point d'entrée de section. Les `README.md`
sont co-localisés avec le code (un par dossier : `app/`, `app/components/`, `services/`,
`server/`, `shared/`…) et portent les conventions opérationnelles au plus près des fichiers.

## README de dossier : un contrat contrôlé

Le `README.md` d'un dossier n'est pas de la documentation passive. Il suit un modèle strict à
deux chapitres : **Rôle et responsabilités** puis **Conventions techniques**. Les conventions
techniques automatisables sont protégées par la CI : chaque convention courte est formalisée
en règle YAML, vérifiée par un script, et bloque le merge si elle échoue.

C'est le principal garde-fou du code généré par l'IA. La boucle complète (README → `docs/` →
règle YAML → script CI → gate avant merge) est documentée dans son propriétaire :
[../3.application/ci-conventions-validation.md](../3.application/ci-conventions-validation.md).

## Workflow de delivery

1. Qualifier la demande et identifier le profil dominant attendu (ex. `nuxt`, `review`,
   `github`).
2. Lire les sources minimales utiles (voir l'ordre de lecture ci-dessus).
3. Faire un diff minimal et relisible, sans refactor hors scope.
4. Mettre à jour la documentation impactée dans le même scope que le changement.
5. Relire le diff avant de conclure.
6. Ne lancer les validations qualité (`lint`, `format`, `type-check`, tests) que sur demande
   explicite, en préparation de contribution ou avant intégration — pas après chaque
   modification.

## Règle de non-duplication

Chaque information a un propriétaire principal. Les autres documents renvoient vers cette
source au lieu de recopier le contenu.

- Un `README.md` local peut rappeler une convention courte et pointer vers
  `docs/2.architecture/`.
- Une tâche `dev-book/tasks/` peut lister la documentation à mettre à jour, mais ne devient
  pas la documentation durable.
- Un runbook ne remplace pas une tâche : il documente une opération exceptionnelle à
  exécuter de façon contrôlée.

## Skills

> À documenter ultérieurement : un chapitre détaillant les skills disponibles et leur
> périmètre d'usage. Objectif : **aligner les skills entre Codex et Claude** pour qu'un même
> besoin déclenche le même outillage quel que soit l'assistant utilisé depuis VSCode.

## Points de vigilance

- Respecter les frontières de responsabilité définies par `docs/2.architecture/`.
- Ne pas dupliquer une information déjà portée par une source plus durable.
- Vérifier que la cascade de gouvernance reste cohérente : le fichier local précise le
  global, il ne le contredit pas.
