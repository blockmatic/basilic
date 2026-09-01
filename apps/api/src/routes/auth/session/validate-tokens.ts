import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { hashToken } from '../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../schemas.js'

const ValidateTokensSchema = Type.Object({
  refreshToken: Type.String(),
})

const ValidateTokensResponseSchema = Type.Object({
  valid: Type.Boolean(),
})

/**
 * Non-mutating pair check for the Next.js cookie adapter.
 * Do not rotate or revoke here — refresh.ts owns rotation and reuse detection.
 */
const sessionValidateTokensRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/validate-tokens',
    {
      schema: {
        operationId: 'validateTokens',
        description: 'Validate access and refresh token pair without rotation',
        summary: 'Validate tokens',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: ValidateTokensSchema,
        response: {
          200: ValidateTokensResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })

      const { refreshToken } = request.body

      let decoded: {
        typ?: string
        sub?: string
        sid?: string
        jti?: string
      }
      try {
        decoded = fastify.jwt.verify<typeof decoded>(refreshToken)
      } catch {
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        })
      }

      if (decoded.typ !== 'refresh' || !decoded.sub || !decoded.sid || !decoded.jti)
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        })

      if (decoded.sub !== request.session.user.id || decoded.sid !== request.session.session.id)
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Token pair mismatch',
        })

      const db = await getDb()
      const [session] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))

      if (!session)
        return reply.code(401).send({
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        })

      if (session.expiresAt < new Date())
        return reply.code(401).send({
          code: 'EXPIRED_TOKEN',
          message: 'Refresh token has expired',
        })

      const jtiHash = hashToken(decoded.jti)
      if (session.token !== jtiHash)
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        })

      return reply.code(200).send({ valid: true })
    },
  )
}

export default sessionValidateTokensRoute
export const prefixOverride = '/auth/session'
