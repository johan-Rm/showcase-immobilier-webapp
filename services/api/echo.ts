import type { JsonFetcher } from '#shared/types/echo'

import {
  echoRequestSchema,
  echoResponseSchema,
  type EchoRequest,
  type EchoResponse,
} from '#shared/schemas'

export const postEcho = async (input: EchoRequest, fetcher: JsonFetcher): Promise<EchoResponse> => {
  const payload = echoRequestSchema.parse(input)
  const data = await fetcher<unknown>('/api/echo', { method: 'POST', body: payload })
  return echoResponseSchema.parse(data)
}
