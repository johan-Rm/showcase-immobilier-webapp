export type uuid = Record<string, unknown>

export interface CategoryCodeMetadata {
  /**
   * Flag d'activation global du code. Stocke dans metadata, pas comme colonne dediee.
   */
  isEnabled?: boolean
}

export interface CategoryCode {
  id: uuid
  /**
   * Code stable kebab-case utilise comme identifiant metier dans un code set.
   */
  codeValue: string
  /**
   * Libelle localise expose cote orchestrateur. Correspond au label de traduction API.
   */
  name: string
  /**
   * Famille fonctionnelle du code, par exemple real-estate-listing ou accommodation-place.
   */
  inCodeSet?: string
  /**
   * Texte localise optionnel associe au code.
   */
  text?: string
  metadata?: CategoryCodeMetadata
}