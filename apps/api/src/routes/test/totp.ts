import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../db/index.js'
import { totpSetup } from '../../db/schema/index.js'
import { env } from '../../lib/env.js'
import { decryptTotpSecret, generateTotpCode } from '../../lib/totp.js'

const TotpCurrentResponseSchema = Type.Object({
  code: Type.String(),
})

const totpTestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/current',
    {
      schema: {
        operationId: 'getTestTotpCurrent',
        description: 'Get current TOTP code for in-progress setup (E2E only, requires Bearer)',
        summary: 'Get current TOTP code',
        tags: ['test'],
        security: [{ bearerAuth: [] }],
        response: {
          200: TotpCurrentResponseSchema,
          401: Type.Object({ code: Type.String(), message: Type.String() }),
          404: Type.Object({ code: Type.String(), message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      if (!env.ALLOW_TEST || env.NODE_ENV === 'production')
        return reply.code(404).send({ code: 'NOT_FOUND', message: 'Not found' })

      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const userId = request.session.user.id
      const db = await getDb()
      const [setup] = await db.select().from(totpSetup).where(eq(totpSetup.userId, userId))

      if (!setup)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'No TOTP setup in progress',
        })

      if (setup.expiresAt < new Date())
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Setup expired',
        })

      const secret = decryptTotpSecret(setup.secretEncrypted)
      if (!secret)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Failed to decrypt secret',
        })

      const code = await generateTotpCode(secret)
      return reply.code(200).send({ code })
    },
  )
}

export default totpTestRoute
export const prefixOverride = '/test/totp'
