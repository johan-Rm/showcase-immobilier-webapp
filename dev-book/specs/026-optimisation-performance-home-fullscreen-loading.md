# Spec: Optimisation performance home fullscreen loading

## Metadonnees

- ID: SPEC-026
- Statut: Propose
- Page cible: `app/pages/index.vue`
- Rapports de reference:
  - `lighthouse.json`
  - `@localhost.har`

## 1. Intention

Optimiser la page d accueil fullscreen en donnant la priorite absolue au rendu du landing screen (premier ecran visible), tout en preparant en arriere-plan les ressources lourdes des screens suivants pour eviter les latences au scroll.

## 2. Objectif principal

Ameliorer la performance percue et mesuree de `app/pages/index.vue` en reduisant le cout critique initial (CPU, JS, CSS, media visibles) sans degrader l experience de navigation verticale fullscreen.

## 3. Perimetre

- Inclus:
  - orchestration de chargement dans `app/pages/index.vue`
  - priorisation des assets du landing screen
  - chargement background des assets lourds hors viewport
  - ajustements des composants Home directement impliques par la strategie de chargement
- Exclu:
  - refactor global hors home
  - redesign visuel complet
  - optimisation transverse de toutes les pages du site

## 4. User stories

- US1 (P1): En tant que visiteur, je vois rapidement le contenu du premier screen sans attente perceptible.
- US2 (P1): En tant que visiteur, quand je commence a scroller, les sections suivantes apparaissent sans rupture ni flash de chargement.
- US3 (P2): En tant que dev, je peux piloter clairement la priorisation des ressources (critical vs background) depuis une logique lisible et maintenable.

## 5. Criteres d acceptation

- CA1: Le landing screen est traite comme chemin critique (assets et execution prioritaires).
- CA2: Les ecrans non visibles au premier rendu chargent leurs ressources lourdes en arriere-plan (sans bloquer le rendu initial).
- CA3: Le comportement fullscreen existant est preserve (navigation et transitions non regressives).
- CA4: Aucune regression SEO/SSR/a11y introduite (metas, rendu SSR, structure semantique et focus keyboard conserves).
- CA5: La strategie de chargement est explicite dans le code (separation claire entre critical load et background load).
- CA6: Les mesures post-implementation montrent une amelioration du score Performance Lighthouse et des metriques critiques (FCP/LCP/TBT), comparees au baseline du rapport annexe.

## 6. Contraintes techniques

- Mobile-first, SSR-safe par defaut.
- Pas de dependance ajoutee sans justification explicite.
- Pas de sur-ingenierie: viser une V1 simple, locale et lisible.
- Respect de l architecture locale (`pages` orchestre, `components` affiche, logique metier hors UI).

## 7. Strategie d execution

1. Etablir un baseline a partir de `lighthouse.json` et `@localhost.har` (poids, chaines critiques, ressources dominantes).
2. Identifier les ressources strictement necessaires au landing screen (critical path).
3. Deprioriser/deferrer ce qui n est pas necessaire au premier viewport (JS, CSS, images, media hors ecran).
4. Mettre en place un prechargement background controle des sections suivantes.
5. Rejouer les mesures Lighthouse/HAR et comparer aux valeurs baseline.
6. Ajuster jusqu a stabilisation d un gain net sans regression UX fullscreen.

## 8. Risques et vigilance

- RISK-001: Charger trop agressivement en background peut reintroduire de la contention CPU/reseau.
- RISK-002: Deferer trop tard certaines ressources peut degrader la fluidite lors du premier scroll.
- RISK-003: Regressions SSR/hydratation si la priorisation est implementee avec des gardes client-only inadaptees.
- RISK-004: Gains Lighthouse non representatifs si le protocole de mesure n est pas stable (extensions, profil navigateur, cache).

## 9. Definition of done

- Criteres d acceptation CA1 a CA6 valides.
- Verification locale de non-regression:
  - `bun run lint:check`
  - `bun run format:check`
  - `bun run type-check`
- Resultats Lighthouse/HAR avant/apres documentes dans la task d execution associee.
