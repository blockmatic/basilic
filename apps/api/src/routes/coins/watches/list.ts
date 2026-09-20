import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { listWatches } from '@repo/db'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import {
  coinsRouteRateLimitConfig,
  toWatchItem,
  WatchItemSchema,
} from '../../../lib/coins/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const coinsWatchesListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        operationId: 'listCoinWatches',
        description:
          'List the access JWT user watchlist keyed by asset id. Empty list is []. Cap 20 is enforced on PUT.',
        summary: 'List coin watches',
        tags: ['coins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: Type.Array(WatchItemSchema),
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      const { watches } = await listWatches({ userId: request.session.user.id })
      return reply.code(200).send(watches.map(watch => toWatchItem({ watch })))
    },
  )
}

export default coinsWatchesListRoute
export const prefixOverride = '/coins/watches'
