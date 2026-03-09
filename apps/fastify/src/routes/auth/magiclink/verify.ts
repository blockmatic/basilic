import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { users, verification } from '../../../db/schema/index.js'
import { hashToken } from '../../../lib/jwt.js'
import { createSessionAndIssueTokens } from '../../../lib/session.js'
import { ErrorResponseSchema } from '../../schemas.js'

const VerifySchema = Type.Object({
  token: Type.String(),
})

const VerifyResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const magicLinkVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'magiclinkVerify',
        description: 'Verify magic link token and return JWTs',
        summary: 'Verify magic link',
        tags: ['auth'],
        security: [],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { token } = request.body
      if (!/^\d{6}$/.test(token))
        return reply.code(400).send({
          code: 'INVALID_TOKEN',
          message: 'Token must be a 6-digit code',
        })
      const tokenHash = hashToken(token)

      const db = await getDb()

      // Find verification record (magic_link only - link_email uses separate flow)
      const [verificationRecord] = await db
        .select()
        .from(verification)
        .where(and(eq(verification.value, tokenHash), eq(verification.type, 'magic_link')))

      if (!verificationRecord)
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        })

      // Check expiration
      if (verificationRecord.expiresAt < new Date()) {
        // Clean up expired record
        await db.delete(verification).where(eq(verification.id, verificationRecord.id))
        return reply.code(401).send({
          code: 'EXPIRED_TOKEN',
          message: 'Token has expired',
        })
      }

      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, verificationRecord.identifier))

      if (!user)
        return reply.code(404).send({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        })

      // Delete verification record (single-use)
      await db.delete(verification).where(eq(verification.id, verificationRecord.id))

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        fastify,
        db,
        userId: user.id,
      })

      return reply.code(200).send({
        token: accessToken,
        refreshToken,
      })
    },
  )
}

export default magicLinkVerifyRoute
export const prefixOverride = '/auth/magiclink'
