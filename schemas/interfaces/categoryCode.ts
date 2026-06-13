export type uuid = Record<string, unknown>

export interface CategoryCode {
  id?: uuid
  codeValue: string
  name: string
  inCodeSet?: string
  text?: string
  metadata?: {
    isEnabled?: boolean
  }
}
