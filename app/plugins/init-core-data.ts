/**
 * Charge les données critiques (web pages, métadonnées) avant que les pages rendent.
 *
 * Sans ce plugin, initCoreData tourne uniquement dans onNuxtReady (client) :
 * le SSR enverrait des pages vides et le premier rendu client lancerait
 * une erreur 404 sur toute route autre que l'accueil.
 *
 * Le guard sur 'ready' évite un double appel quand le payload SSR hydrate
 * déjà le statut côté client.
 */
export default defineNuxtPlugin(async () => {
  const { initCoreData, initCoreDataStatus } = useNuxtServerInit()

  if (initCoreDataStatus.value === 'ready') return

  await initCoreData()
})
