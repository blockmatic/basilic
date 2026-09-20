import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { watchAsset } from '@repo/db'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError, sendServerCatalogError } from '../../../lib/catalogs/mapper.js'
import {
  coinsRouteRateLimitConfig,
  toWatchItem,
  WatchItemSchema,
} from '../../../lib/coins/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const AssetIdParamsSchema = Type.Object({
  assetId: Type.String({ minLength: 1 }),
})

const coinsWatchesPutRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().put(
    '/:assetId',
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        operationId: 'putCoinWatch',
        description:
          'Watch an identity asset id for the access JWT user. Idempotent. Unknown asset is 404. Cap 20 is 409 WATCHLIST_FULL.',
        summary: 'Watch a coin',
        tags: ['coins'],
        security: [{ bearerAuth: [] }],
        params: AssetIdParamsSchema,
        response: {
          200: WatchItemSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      const { watch, error } = await watchAsset({
        userId: request.session.user.id,
        assetId: request.params.assetId,
      })
      if (error === 'not_found') return sendCatalogError({ reply, status: 404, code: 'NOT_FOUND' })
      if (error === 'limit') return sendCatalogError({ reply, status: 409, code: 'WATCHLIST_FULL' })
      if (!watch) return sendServerCatalogError({ request, reply, code: 'SERVER_ERROR' })
      return reply.code(200).send(toWatchItem({ watch }))
    },
  )
}

export default coinsWatchesPutRoute
export const prefixOverride = '/coins/watches'
