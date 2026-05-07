export type ApiError = {
  status: number
  message: string
  details?: unknown
}

export type JsonFetcher = <T = unknown>(
  request: string,
  options: { method: 'POST'; body: Record<string, unknown> | BodyInit | null | undefined },
) => Promise<T>
