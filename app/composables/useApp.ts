import type { App } from '#shared/types/app'
import type { LocaleCode } from '#shared/types/i18n'
import type { ComputedRef, Ref } from 'vue'

import { computed } from 'vue'

import { useMetadata } from '~/composables/useMetadata'
import { useMetadataStore } from '~/stores/metadata'

/**
 * Contrat public du composable `useApp`.
 *
 * Il expose la locale courante, la donnée `app` réactive et les helpers utiles
 * pour charger ou relire la configuration globale déjà hydratée dans le store.
 */
type UseAppReturn = {
  locale: Ref<LocaleCode>
  appData: ComputedRef<App | null>
  loadApp: () => Promise<void>
  getApp: () => App | null
}

/**
 * Expose l'accès réactif à la donnée `app` chargée dans le store metadata.
 *
 * Responsabilités :
 * - relayer la locale courante utilisée par les loaders de contenu
 * - charger le document `app` via le pipeline metadata existant
 * - fournir un accès réactif unique à la configuration globale du site
 *
 * @returns API réactive orientée `app` pour les pages et composables métier.
 *
 * @example
 * const { appData, loadApp } = useApp()
 * await loadApp()
 * const app = appData.value
 */
export const useApp = (): UseAppReturn => {
  const { localeSetting } = useLang()
  const { loadApp } = useMetadata()
  const store = useMetadataStore()
  const locale = computed(() => localeSetting.value)
  const appData = computed<App | null>(() => store.getApp)

  /**
   * Retourne la donnée `app` actuellement disponible dans le store.
   *
   * @returns Configuration globale localisée ou `null` si elle n'est pas chargée.
   */
  const getApp = (): App | null => appData.value

  return {
    locale,
    appData,
    loadApp,
    getApp,
  }
}
