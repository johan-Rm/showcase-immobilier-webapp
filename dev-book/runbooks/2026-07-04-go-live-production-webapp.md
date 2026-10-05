# Runbook — Go-live production webapp

- Date : 2026-07-04
- Cible : webapp Nuxt (SSR) + edge Nginx VPS
- Références : `docs/8.seo/`, `Makefile.prod`, `infra/vps-496-web-edge/` (repo orchestrateur)

Checklist de mise en production. Chaque point annoté avec l'état réel du projet :
✅ déjà en place (à vérifier, pas à construire) · 🔧 à configurer · ⚠️ décision ou manque identifié.

---

## 1. Recette finale

- [ ] Retours et validation finale du client
- [ ] Derniers tests fonctionnels (parcours immersif, listes de biens, fiches, contact, dashboard)
- [ ] Vérification responsive (mobile / tablette / desktop) — mobile-first, parcours screens `data-screen`
- [ ] Vérification cross-browser (Chrome, Safari, Firefox, Edge)
  - ⚠️ Firefox : vérifier l'ordre de chargement des images (cf. `docs/9.performance/image-loading-order-firefox.md`)

## 2. Préparation de la mise en ligne

- [ ] 🔧 Créer `.env.prod` depuis `.env.example` avec des identifiants Docker **distincts** de dev/preprod (`COMPOSE_PROJECT_NAME`, `APP_STACK_NETWORK_NAME`, `EDGE_ALIAS`)
- [ ] 🔧 `APP_ENV=prod` + `SITE_URL` définitif + `SITE_NAME` — conditionnent l'indexation, le sitemap, robots.txt et les canonicals
- [ ] 🔧 `MEDIA_HOST_DIR`, `CONTENT_HOST_DIR`, `DATA_HOST_DIR` pointés vers les chemins serveur persistants
- [ ] ✅ Préflight bloquant : `make prod-check` (refuse les placeholders et les identifiants de dev)
- [ ] Déploiement : `make prod-deploy` puis `make prod-content-sync`
- [ ] `make prod-status` + `make prod-logs-webapp` — vérifier le démarrage sans erreur

### Formulaire de contact

- [ ] 🔧 Renseigner `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CONTACT_BCC_EMAILS`, `CONTACT_REPLY_TO_EMAIL`
- [ ] ✅ Persistance : CSV dans `.data/contact-submissions.csv` (pas de base de données — monté via `DATA_HOST_DIR`, survit à la recréation du conteneur)
- [ ] Test réel de bout en bout : soumission → CSV écrit → email interne reçu → email de confirmation visiteur reçu
- [ ] 🔧 Vérifier le domaine d'envoi Resend : SPF, DKIM, DMARC validés (sinon les emails partent en spam)
- [ ] Vérifier que l'email de confirmation ne part pas en spam (Gmail, Outlook)

### Pages d'erreur

- [ ] ✅ `app/error.vue` existe — tester une URL 404 réelle en prod (rendu, i18n, pas de fuite de stacktrace)
- [ ] Tester le comportement 500 (ex. API Symfony coupée) — le site public doit rester debout

## 3. Internationalisation

- [ ] ✅ 3 locales actives : fr / en / es, stratégie `prefix` (`/fr/`, `/en/`, `/es/`)
- [ ] Vérifier les contenus traduits synchronisés (`content/fr|en|es/`) après `prod-content-sync`
- [ ] ✅ `hreflang` générés par `buildAlternateLinks` dans `usePageSeo` (+ `x-default` → locale fallback) — contrôler sur 2-3 pages rendues
- [ ] Vérifier les chemins localisés des routes biens (`/biens/`, `/properties/`, `/propiedades/`)
- [ ] Vérifier la redirection racine `/` → locale (cookie `i18n_redirected`, `redirectOn: 'root'`)

## 4. SEO

- [ ] ✅ Sitemap `@nuxtjs/sitemap` + source dynamique `/api/__sitemap__/urls` (biens inactifs exclus, régénération automatique) — vérifier `/sitemap.xml` en prod
- [ ] ⚠️ `includeAppSources: true` découvre **toutes** les routes de `app/pages/` : vérifier que `echo`, `dashboard/*` et autres routes techniques ne figurent pas dans le sitemap
- [ ] ✅ `robots.txt` dynamique (`server/routes/robots.txt.ts`) : `Allow: /` + pointeur sitemap **uniquement si** `APP_ENV=prod` et runtime production — vérifier en prod ET en preprod (`Disallow: /` attendu)
- [ ] ✅ Indexation : `isIndexable` = `APP_ENV=prod` + `NODE_ENV=production` — vérifier la meta `robots` = `index, follow` sur une page publique
- [ ] ✅ Dashboard : layout force `noindex, nofollow` — contrôler `/fr/dashboard`
- [ ] ✅ Canonicals absolues via `toAbsoluteUrl(SITE_URL, path)` — contrôler qu'aucune URL ne pointe vers localhost
- [ ] ✅ Title / meta description / OG / Twitter Card via `usePageSeo` — contrôler homepage, une liste, une fiche bien
- [ ] ✅ Données structurées JSON-LD (`services/seo/schema.ts`) — valider avec le [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Vérification de la sémantique HTML (h1 unique par page, landmarks)
- [ ] 🔧 Google Search Console : ajouter la propriété, vérifier le domaine
- [ ] 🔧 Soumettre le sitemap à Google
- [ ] Suivre l'indexation les jours suivants (couverture GSC)

## 5. Mesure d'audience

- [ ] ⚠️ **Aucun outil d'analytics n'est installé** (ni GA, ni Plausible, ni Matomo) — décision à prendre avant le go-live
- [ ] ⚠️ Si Google Analytics : bannière de consentement RGPD obligatoire (rien n'existe) ; alternative sans consentement : Plausible / Matomo configuré cookieless
- [ ] `WEB_VITALS_ENABLED` existe dans la config — décider de son activation et vérifier son branchement effectif
- [ ] Vérifier le déclenchement des événements après mise en place

## 6. Sécurité

- [ ] ✅ SSL : Let's Encrypt via certbot sur l'edge (`edge-cert.sh`) — émettre le certificat du domaine final avant le basculement DNS
- [ ] ✅ Redirection HTTP → HTTPS gérée par l'edge — vérifier sur le domaine final
- [ ] ✅ HSTS : `max-age=31536000` dans `ssl-common.conf` — ⚠️ sans `includeSubDomains` ni `preload` (choix à confirmer)
- [ ] ✅ CSP posée sur le vhost edge `showcase-webapp.conf` (`object-src 'none'`, `frame-ancestors 'self'`, `form-action 'self'`, sandbox) — tester le site complet avec la console ouverte (aucune violation)
- [ ] ✅ `X-Content-Type-Options: nosniff` + `Referrer-Policy` (nginx applicatif) — contrôler les en-têtes de réponse avec `curl -I`
- [ ] ⚠️ Pas de reCAPTCHA sur le formulaire de contact — protection actuelle : honeypot (champ `website`). Décider si suffisant pour le lancement ; vérifier que le rate-limiting edge (`rate-limit-dynamic.conf`) couvre `/api/contact`
- [ ] 🔧 `NUXT_SESSION_PASSWORD` : vrai secret ≥ 32 caractères (`openssl rand -base64 48`) — le préflight refuse le placeholder
- [ ] 🔧 `AUTHORIZED_CLIENT_EMAILS` : liste finale des emails autorisés au dashboard
- [ ] 🔧 `SYMFONY_SERVICE_EMAIL` / `SYMFONY_SERVICE_PASSWORD` : compte de service prod dédié
- [ ] Vérifier `SCALAR_API_DOCS_ENABLED` absent ou `false` en prod (`/api-docs` ne doit pas répondre)
- [ ] `DASHBOARD_SAVE_DEBUG=0`
- [ ] Tester l'OAuth Google du dashboard sur le domaine final (redirect URI prod déclarée dans la console Google Cloud)

## 7. Performances

- [ ] ✅ Gzip actif (nginx applicatif + edge), HTTP/2 + HTTP/3 sur l'edge — vérifier `Content-Encoding` sur les réponses
- [ ] ✅ Cache : `/_nuxt/` immutable 1 an, `themes.css|json` en SWR 300s, HTML no-cache — vérifier les `Cache-Control` en prod
- [ ] Pas de Varnish : l'edge Nginx + SWR Nitro couvrent le besoin — n'ajouter un cache supplémentaire que sur constat de charge réelle
- [ ] ✅ Images via `@nuxt/image` — vérifier les formats servis (webp/avif) et les `srcset` sur le parcours immersif
- [ ] Audit Lighthouse / PageSpeed Insights sur : homepage, liste de biens, fiche bien (mobile en priorité — Core Web Vitals prioritaires)
- [ ] Audit WebPageTest et/ou GTmetrix depuis une localisation européenne
- [ ] Vérifier le poids JS initial (chunks vendor-gsap, vendor-embla, vendor-i18n déjà séparés)

## 8. Vérifications finales

- [ ] Absence de liens cassés (crawl avec Screaming Frog ou `broken-link-checker` sur le domaine final)
- [ ] ⚠️ Contenu de démonstration :
  - `ACCOMMODATION_FIXTURES_ENABLED=false` en prod
  - vérifier que les biens fictifs du POC (villa-des-alizes et exemples anonymisés) ne sont en ligne que si c'est voulu
  - la page `echo.vue` et `/api/echo` : confirmer qu'elles doivent rester accessibles en prod
- [ ] Surveiller les logs après mise en ligne : `make prod-logs-webapp` (premières heures)
- [ ] 🔧 Sauvegardes serveur : `.data/` (contacts CSV), `MEDIA_HOST_DIR` (images), `CONTENT_HOST_DIR` (contenu), `/etc/letsencrypt` — **tester une restauration**, pas seulement la sauvegarde
- [ ] Procédure de rollback : re-déploiement de l'image précédente (`make prod-build` sur le commit antérieur + `prod-up`) — la documenter si le go-live est sensible

---

## Points ouverts avant go-live — décisions du 2026-07-04

1. **Analytics** : outil self-hosted installé **globalement sur le VPS** (multi-projets) — tâche dédiée à créer dans `dev-book/tasks/`.
2. **Anti-spam contact** : décidé — pas de captcha, honeypot suffisant pour le lancement.
3. **Sitemap** : à corriger — exclure les routes techniques (`echo`, `dashboard`) du sitemap.
4. **HSTS** : recommandation — garder `max-age` seul au lancement. `ssl-common.conf` est partagé par tous les vhosts de l'edge : `includeSubDomains` engagerait tous les sous-domaines de tous les projets, et `preload` est quasi irréversible. À réévaluer plus tard par domaine si besoin.
5. **Contacts en base** : décidé — les soumissions de contact seront persistées via l'API Symfony (projet séparé), le CSV devient un fallback — tâche dédiée à créer.
6. **Contenu POC** : statut des villas fictives au lancement (toujours ouvert).

> Les tâches (analytics, contacts en base) et la correction sitemap sont suspendues le temps de
> la revue de code pré-production en cours.
