---
status: A faire
source: brief temps reel site public
dependances: 009-dashboard-reexport-markdown-apres-sauvegarde.md
---

# 010 Site public — Mise a jour en temps reel apres sauvegarde dashboard

## Intention

Quand un bien est sauvegarde depuis le dashboard (task 008) et que son fichier Markdown
est regenere (task 009), le site public doit refleter les modifications sans que
les visiteurs aient besoin de recharger la page manuellement.

Le site public utilise SSR + `readFile` Node.js au runtime — pas de rebuild necessite.
Le probleme est le cache SWR de 300s (5 min) en production et l absence de notification
vers les clients deja charges.

## Constat technique

- `nuxt.config.ts` : `swr: 300` sur les routes de contenu en production
- `server/utils/content/loaders.ts` : lecture `readFile` au runtime — le fichier a jour
  est accessible immediatement apres le write de task 009
- Sans invalidation, le site peut servir une version cachee pendant jusqu a 5 minutes
- Sans notification client, la page deja ouverte ne se met pas a jour

## Perimetre

- invalider le cache SWR Nitro des routes affectees apres chaque write Markdown
- mettre en place un mecanisme de notification pour les pages deja ouvertes :
  polling leger cote client ou SSE (Server-Sent Events)
- quand une mise a jour est detectee, re-fetcher les donnees de l accommodation active
  sans rechargement complet de la page

## Hors perimetre

- temps reel sur toutes les ressources de contenu (scope = accommodations uniquement)
- WebSocket bidirectionnel
- notifications push navigateur
- invalidation CDN ou cache HTTP externe
- dashboard (il a deja son propre refresh via `?refresh=1` en task 009)

## Contraintes

- SSR-safe : le polling ne demarre que cote client (`onMounted`)
- ne pas degrader les performances du site public (intervalle minimum 30s)
- stopper le polling quand la page est cachee (`document.visibilityState`)
- pas de dependance supplementaire — utiliser les primitives Nuxt existantes

## Architecture

### 1. Invalidation cache SWR apres write

Apres le write Markdown reussi (task 009), la route Nitro PUT appelle :

```ts
await useStorage('cache').removeItem(`nitro:handlers:${routeKey}`)
```

ou utilise `event.waitUntil` + `purgeCache` selon la version Nitro disponible.

Routes a invalider : la page de detail du bien modifie (`/fr/biens/[slug]`)
et eventuellement la page liste si le bien y apparait.

### 2. Endpoint de version de contenu

Creer `GET /api/content-version` :

- retourne `{ version: string, updatedAt: string }`
- `version` = hash MD5 ou timestamp de la derniere modification dans `content/fr/accommodations/`
- calcule via `fs.stat` sur les fichiers (pas de lecture complete)
- cache court : 5s maximum

### 3. Polling client (composable useContentVersion)

```ts
// app/composables/useContentVersion.ts
const { version } = await useFetch('/api/content-version', { ... })

// polling toutes les 30s, stoppe si page cachee
onMounted(() => {
  const interval = setInterval(async () => {
    if (document.visibilityState === 'hidden') return
    const { data } = await $fetch('/api/content-version')
    if (data.version !== version.value) {
      await refreshNuxtData()   // ou refresh cible sur la cle useFetch du bien actif
      version.value = data.version
    }
  }, 30_000)
  onUnmounted(() => clearInterval(interval))
})
```

Ce composable est monte uniquement sur les pages qui affichent des accommodations.

### Alternative : SSE (Server-Sent Events)

Si le polling toutes les 30s est insuffisant, remplacer par un flux SSE :

- `GET /api/content-events` ouvre un flux `text/event-stream`
- apres chaque write Markdown, le serveur emet un evenement `accommodation-updated`
  avec le slug du bien modifie
- le client ecoute et ne re-fetche que le bien concerne

SSE est plus reactif mais plus complexe a maintenir avec des connexions longues.
A privilegier si le polling 30s ne satisfait pas le besoin.

## Etapes

### 1. Invalider le cache SWR dans la route Nitro PUT (task 009)

- identifier l API Nitro disponible pour l invalidation de cache SWR
- appeler l invalidation sur les routes de l accommodation sauvegardee

### 2. Endpoint GET /api/content-version

- creer `server/api/content-version.get.ts`
- retourner un hash base sur `mtime` des fichiers `content/fr/accommodations/`
- cache 5s

### 3. Composable useContentVersion

- creer `app/composables/useContentVersion.ts`
- polling 30s avec pause sur `visibilityState = hidden`
- appeler `refreshNuxtData()` sur changement de version

### 4. Integration sur les pages accommodations

- monter `useContentVersion` dans les pages ou screens qui affichent un bien
- verifier que le refresh ne provoque pas de flash ou perte d etat UI

### 5. Valider

- verifier qu une modification dashboard est visible sur le site public en moins de 35s
- verifier que le polling s arrete quand l onglet est en arriere-plan
- verifier l absence de regression SSR et de boucle infinie de re-fetch

## Criteres d acceptation

- apres un Save dashboard, le site public affiche la modification en moins de 35s
  sans rechargement manuel
- le cache SWR ne sert plus de donnees perimees sur les routes invalidees
- le polling ne tourne pas quand la page est en arriere-plan
- aucune regression sur les performances du site public (LCP, CLS inchanges)

## Points de vigilance

- **SWR et CDN** : si un CDN est en place devant Nitro, l invalidation SWR Nitro ne
  suffit pas — il faudra aussi invalider le cache CDN (hors perimetre V1).
- **Intervalle de polling** : 30s est un compromis acceptable pour du "temps reel"
  editorial. Si besoin d un delai plus court, passer a SSE.
- **refreshNuxtData scope** : un `refreshNuxtData()` global relance tous les useFetch
  de la page — cibler uniquement la cle du bien actif pour eviter des appels superflus.
- **Connexions SSE en production** : les SSE maintiennent une connexion ouverte par
  client — a surveiller si le nombre de visiteurs simultanes est important.
