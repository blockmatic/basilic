import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { totp, totpSetup } from '../../../../db/schema/index.js'
import { decryptTotpSecret, verifyTotpCode } from '../../../../lib/totp.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const VerifySchema = Type.Object({
  code: Type.String({ minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$' }),
})

const VerifyResponseSchema = Type.Object({
  ok: Type.Literal(true),
})

const totpVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'accountLinkTotpVerify',
        description: 'Verify TOTP code and persist authenticator',
        summary: 'TOTP verify',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const { code } = request.body
      const userId = request.session.user.id

      const db = await getDb()
      const [setup] = await db.select().from(totpSetup).where(eq(totpSetup.userId, userId))

      if (!setup)
        return reply.code(400).send({
          code: 'EXPIRED_SETUP',
          message: 'No setup in progress. Start setup again.',
        })

      if (setup.expiresAt < new Date()) {
        await db.delete(totpSetup).where(eq(totpSetup.id, setup.id))
        return reply.code(400).send({
          code: 'EXPIRED_SETUP',
          message: 'Setup expired. Start setup again.',
        })
      }

      const secret = decryptTotpSecret(setup.secretEncrypted)
      if (!secret)
        return reply.code(500).send({
          code: 'SERVER_ERROR',
          message: 'Failed to decrypt secret',
        })

      const valid = await verifyTotpCode({ secret, token: code })
      if (!valid)
        return reply.code(400).send({
          code: 'INVALID_CODE',
          message: 'Invalid verification code',
        })

      const encrypted = setup.secretEncrypted
      await db.transaction(async tx => {
        await tx.delete(totpSetup).where(eq(totpSetup.id, setup.id))
        await tx.insert(totp).values({
          id: randomUUID(),
          userId,
          secretEncrypted: encrypted,
        })
      })

      return reply.code(200).send({ ok: true })
    },
  )
}

export default totpVerifyRoute
export const prefixOverride = '/account/link/totp'
