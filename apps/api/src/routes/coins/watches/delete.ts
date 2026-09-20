import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { unwatchAsset } from '@repo/db'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { coinsRouteRateLimitConfig } from '../../../lib/coins/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const AssetIdParamsSchema = Type.Object({
  assetId: Type.String({ minLength: 1 }),
})

const coinsWatchesDeleteRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:assetId',
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        operationId: 'deleteCoinWatchById',
        description:
          'Remove an asset id from the access JWT user watchlist. Missing rows still return 204.',
        summary: 'Unwatch a coin',
        tags: ['coins'],
        security: [{ bearerAuth: [] }],
        params: AssetIdParamsSchema,
        response: {
          204: Type.Null(),
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      await unwatchAsset({
        userId: request.session.user.id,
        assetId: request.params.assetId,
      })
      return reply.code(204).send(null)
    },
  )
}

export default coinsWatchesDeleteRoute
export const prefixOverride = '/coins/watches'
