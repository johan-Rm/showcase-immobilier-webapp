# Spec: Render first boot shell non bloquant

## Metadonnees

- ID: SPEC-027
- Statut: Propose
- Perimetre cible:
  - `app/app.vue`
  - `app/layouts/default.vue`
  - `app/composables/useNuxtServerInit.ts`
- Document de reference:
  - `FLUX.md`
- Rapports de reference:
  - `lighthouse.chrome.json`
  - `lighthouse.mobile.json`

## 1. Intention

Remplacer le bootstrap global bloquant par une strategie "render first" dans laquelle l application affiche immediatement un shell fullscreen minimal avec logo centre, puis charge les donnees core en arriere-plan sans bloquer le premier rendu visible.

## 2. Objectif principal

Ameliorer significativement `FCP` et `LCP` en retirant les attentes metier du chemin critique de rendu initial, tout en conservant un comportement SSR-safe et une transition lisible vers l application chargee.

## 3. Perimetre

- Inclus:
  - orchestration du boot dans `app/app.vue`
  - introduction d un shell de boot plein ecran minimal
  - passage de `initCoreData()` en asynchrone non bloquant
  - adaptation du layout public pour ne pas recharger trop tot des elements globaux non critiques
  - etat explicite de bootstrap (`idle/loading/ready/error` ou equivalent)
- Exclu:
  - redesign complet de la home
  - optimisation transverse de toutes les pages internes
  - refactor global des services de contenu hors besoins directs du boot

## 4. User stories

- US1 (P1): En tant que visiteur, je vois immediatement un premier ecran propre et stable sans attendre le chargement des donnees metier.
- US2 (P1): En tant que visiteur, l application charge ensuite son contenu sans flash brutal ni incoherence visuelle.
- US3 (P1): En tant que dev, je peux distinguer clairement ce qui releve du rendu critique, du bootstrap metier et du chargement differe.
- US4 (P2): En tant que dev, je peux mesurer plus facilement l effet du shell initial sur `FCP/LCP`.

## 5. Criteres d acceptation

- CA1: `app/app.vue` n attend plus `initCoreData()` avant d afficher le premier rendu visible.
- CA2: Le premier rendu visible est un shell fullscreen minimal avec logo centre.
- CA3: Le shell est SSR-safe et identique entre serveur et client au premier rendu.
- CA4: `initCoreData()` demarre en arriere-plan sans bloquer l affichage initial.
- CA5: Les composants globaux non critiques (navigation, overlays, drawers, modales) ne degradent pas le premier rendu.
- CA6: Une transition simple et stable mene du shell initial vers l application prete.
- CA7: Les mesures Lighthouse post-implementation montrent une baisse nette de `FCP` et `LCP` par rapport au baseline actuel.

## 6. Contraintes techniques

- Mobile-first.
- SSR-safe par defaut.
- Pas de dependance ajoutee sans justification.
- Pas de sur-ingenierie: V1 locale, lisible et mesurable.
- Respect de l architecture locale: `app.vue` orchestre, le shell affiche, les donnees restent gerees hors UI.

## 7. Strategie d execution

1. Introduire un etat de bootstrap explicite au niveau racine de l application.
2. Rendre immediatement un shell minimal fullscreen sans dependance aux donnees core.
3. Demarrer `initCoreData()` en asynchrone non bloquant apres le rendu initial.
4. Distinguer les donnees strictement necessaires a la sortie du shell et les donnees differees.
5. Reporter le montage des elements globaux non critiques apres `ready`.
6. Rejouer Lighthouse mobile/chrome pour comparer `FCP`, `LCP` et la part de `render delay`.

## 8. Risques et vigilance

- RISK-001: Un shell trop pauvre peut donner une impression de chargement vide ou artificiel.
- RISK-002: Une transition mal geree peut produire un flash ou une impression de double rendu.
- RISK-003: Certaines metas ou certains contrats peuvent dependre aujourd hui d un bootstrap trop tot.
- RISK-004: Passer le bootstrap en non bloquant sans distinguer les dependances critiques peut introduire des etats incoherents.
- RISK-005: Le shell peut devenir lui-meme un mauvais LCP s il utilise un media trop lourd ou une animation trop couteuse.

## 9. Definition of done

- Criteres d acceptation CA1 a CA7 valides.
- Verification locale de non-regression:
  - `bun run lint:check`
  - `bun run format:check`
  - `bun run type-check`
- Mesures Lighthouse avant/apres documentees dans la suite de la task d execution.
