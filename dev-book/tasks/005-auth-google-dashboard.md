---
status: Done
source: https://nuxt.com/modules/auth-utils
---

# 005 Authentification Google et dashboard minimal

## Intention

Mettre en place une authentification Google minimale pour ouvrir un premier dashboard
reserve a 2 ou 3 comptes autorises.

La V1 doit permettre de valider le socle technique d authentification sans introduire de
gestion de comptes complexe, de base de donnees utilisateur ou de parcours metier avance.

## Perimetre

- installer et configurer `nuxt-auth-utils`
- activer uniquement le provider OAuth Google
- creer une route serveur OAuth Google
- creer une session utilisateur typee et minimale
- limiter l acces aux emails explicitement autorises cote serveur
- creer une page `/dashboard` minimale et protegee
- ajouter un etat connecte/deconnecte exploitable cote UI
- documenter les variables d environnement attendues sans exposer de secret

## Hors perimetre

- authentification par email/mot de passe
- passkeys / WebAuthn
- gestion de roles avancee
- backoffice ou dashboard metier complet
- base de donnees utilisateur
- persistance de tokens Google
- invitation, creation ou administration de comptes depuis l interface

## Contraintes produit et techniques

- Google est le seul provider autorise en V1
- l acces est limite a une allowlist de 2 ou 3 emails Google
- la verification de l allowlist se fait cote serveur dans le handler OAuth
- aucun token OAuth ne doit etre stocke dans la session cookie
- la session cookie ne contient que les donnees minimales d identification
- la page dashboard reste SSR-safe
- le parcours respecte les URLs localisees du projet (`/fr/dashboard`, etc.)
- la solution doit rester compatible avec `nuxt build`, pas avec une generation statique pure

## Variables d environnement

Ajouter la documentation des variables suivantes dans le support adapte (`README`,
documentation application ou exemple env si present) :

```env
NUXT_SESSION_PASSWORD=
NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=
NUXT_OAUTH_GOOGLE_REDIRECT_URL=
AUTHORIZED_CLIENT_EMAILS=
```

Regles :

- `NUXT_SESSION_PASSWORD` contient au moins 32 caracteres
- `AUTHORIZED_CLIENT_EMAILS` contient une liste separee par des virgules
- `NUXT_OAUTH_GOOGLE_REDIRECT_URL` est explicite en production pour eviter les erreurs de
  detection d URL publique
- aucun secret reel ne doit etre commite

## Etapes

### 1. Installer et brancher `nuxt-auth-utils`

- ajouter la dependance `nuxt-auth-utils`
- ajouter le module dans `nuxt.config.ts`
- declarer la configuration runtime OAuth Google via `runtimeConfig.oauth.google`
- verifier que la configuration reste strictement serveur pour les secrets

### 2. Typer la session utilisateur

Creer une declaration de type, par exemple `shared/types/auth.d.ts`, pour etendre
`#auth-utils`.

Session utilisateur minimale attendue :

```ts
interface User {
  id: string
  email: string
  name?: string
  picture?: string
}
```

Ne pas ajouter de champs non utilises en V1.

### 3. Creer le handler OAuth Google

Creer `server/routes/auth/google.get.ts` avec `defineOAuthGoogleEventHandler`.

Comportement attendu :

- demander les scopes minimaux utiles (`email`, `profile`)
- verifier que Google renvoie un email exploitable
- normaliser l email avant comparaison
- verifier l email dans `AUTHORIZED_CLIENT_EMAILS`
- refuser proprement les emails non autorises
- appeler `setUserSession` uniquement apres validation de l allowlist
- rediriger vers le dashboard localise apres succes
- rediriger vers une page publique ou de login apres echec

La session ne doit pas contenir `tokens`, `access_token`, `refresh_token` ou donnee sensible.

### 4. Ajouter une couche d autorisation serveur lisible

Extraire si utile un petit helper serveur pour l allowlist, par exemple dans `server/utils/auth`.

Objectif :

- garder le handler OAuth court
- faciliter le test manuel et la review
- eviter de dupliquer le parsing de `AUTHORIZED_CLIENT_EMAILS`

Ne pas creer d abstraction plus large qu une allowlist email V1.

### 5. Creer le middleware de protection

Creer un middleware nomme `app/middleware/auth.ts`.

Comportement attendu :

- utiliser `useUserSession()`
- laisser passer si l utilisateur est connecte
- rediriger vers une route publique localisee si l utilisateur n est pas connecte
- rester compatible SSR
- ne pas appeler directement d API metier

### 6. Creer la page dashboard minimale

Creer `app/pages/dashboard.vue`.

Contenu minimal attendu :

- structure de page sobre et lisible
- message d accueil avec le nom ou l email du compte connecte
- rappel discret que l espace est reserve aux clients autorises
- action de deconnexion
- aucun contenu metier fictif complexe

La page doit declarer son middleware via `definePageMeta`.

### 7. Ajouter un point d entree de connexion

Ajouter un lien ou bouton de connexion Google depuis un emplacement pertinent.

Comportement attendu :

- utiliser `/auth/google`
- respecter la locale courante pour le retour utilisateur
- ne pas perturber la navigation editoriale existante
- conserver une UI calme, explicite et non agressive

### 8. Documenter la configuration Google OAuth

Documenter les callbacks a configurer dans Google Cloud Console.

Exemples attendus :

- developpement : `http://localhost:3000/auth/google`
- production : `https://<domaine>/auth/google`

La valeur exacte de production doit rester configurable via
`NUXT_OAUTH_GOOGLE_REDIRECT_URL`.

## Criteres d acceptation

- `nuxt-auth-utils` est installe et charge par Nuxt
- `/auth/google` lance le flux OAuth Google
- un email Google autorise obtient une session valide
- un email Google non autorise n obtient pas de session
- `/fr/dashboard` est inaccessible sans session
- `/fr/dashboard` affiche un etat minimal connecte avec les donnees utilisateur
- la deconnexion vide la session et renvoie vers un etat public coherent
- aucune donnee sensible OAuth n est stockee dans le cookie de session
- les variables d environnement necessaires sont documentees
- les checks projet passent au minimum :
  - `bun run lint:check`
  - `bun run format:check`
  - `bun run type-check`

## Points de vigilance

- Securite : l allowlist doit etre appliquee cote serveur, jamais seulement dans l UI.
- Securite : ne pas journaliser les tokens ou donnees OAuth sensibles.
- SSR : le middleware et la page doivent fonctionner au premier rendu serveur.
- Routage : le middleware global de locale ignore deja `/api/*`, mais `/auth/google` est une
  route serveur sans prefixe locale ; verifier qu elle n est pas redirigee a tort.
- SEO : le dashboard ne doit pas etre indexable si un contenu prive est ajoute plus tard.
- Performance : ne pas ajouter de store global ou de bootstrap lourd pour une simple session.
- KISS/YAGNI : pas de modele de roles, pas de base utilisateur, pas de dashboard fictif en V1.
