import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { passkeyAuthChallenges, passkeyCallback } from '../../../db/schema/index.js'
import { generateToken, hashToken } from '../../../lib/jwt.js'
import { getWebAuthnOriginFromRequest } from '../../../lib/passkey.js'
import { verifyPasskeyAuth } from '../../../lib/passkey-auth.js'
import { AuthenticationResponseJSONSchema } from '../../../lib/schemas/webauthn.js'
import { createSessionAndIssueTokens } from '../../../lib/session.js'
import { appendCodeToCallbackUrl, isAllowedUrl } from '../../../lib/url.js'
import { ErrorResponseSchema } from '../../schemas.js'

const callbackCodeExpiryMinutes = 5

const VerifyBodySchema = Type.Object({
  assertion: AuthenticationResponseJSONSchema,
  sessionId: Type.String(),
  callbackUrl: Type.Optional(Type.String()),
})

const VerifyResponseWithRedirectSchema = Type.Object({
  redirectUrl: Type.String(),
})

const VerifyResponseWithTokensSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const passkeyVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'authPasskeyVerify',
        description: 'Verify passkey assertion and create session',
        summary: 'Passkey auth verify',
        tags: ['auth'],
        security: [],
        body: VerifyBodySchema,
        response: {
          200: Type.Union([VerifyResponseWithRedirectSchema, VerifyResponseWithTokensSchema]),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { assertion, sessionId, callbackUrl } = request.body

      const db = await getDb()
      const [challengeRow] = await db
        .select()
        .from(passkeyAuthChallenges)
        .where(eq(passkeyAuthChallenges.sessionId, sessionId))
        .limit(1)

      if (!challengeRow)
        return reply.code(401).send({
          code: 'EXPIRED_CHALLENGE',
          message: 'Challenge expired or not found',
        })

      if (challengeRow.expiresAt < new Date())
        return reply.code(401).send({
          code: 'EXPIRED_CHALLENGE',
          message: 'Challenge has expired',
        })

      const origin = getWebAuthnOriginFromRequest(request.headers.origin)
      if (!origin)
        return reply.code(400).send({
          code: 'INVALID_ORIGIN',
          message: 'Invalid or missing Origin header',
        })

      if (callbackUrl && !isAllowedUrl(callbackUrl))
        return reply.code(400).send({
          code: 'INVALID_CALLBACK_URL',
          message: 'Callback URL origin is not allowed',
        })

      const result = await verifyPasskeyAuth({
        assertion: { ...assertion, clientExtensionResults: assertion.clientExtensionResults ?? {} },
        expectedChallenge: challengeRow.challenge,
        expectedOrigin: origin.expectedOrigin,
        expectedRPID: origin.rpID,
      })

      await db.delete(passkeyAuthChallenges).where(eq(passkeyAuthChallenges.id, challengeRow.id))

      if (!result.ok) return reply.code(401).send({ code: result.code, message: result.message })

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        fastify,
        db,
        userId: result.userId,
      })

      if (callbackUrl) {
        const code = generateToken()
        const codeHash = hashToken(code)
        const expiresAt = new Date(Date.now() + callbackCodeExpiryMinutes * 60 * 1000)
        await db.insert(passkeyCallback).values({
          id: randomUUID(),
          codeHash,
          accessToken,
          refreshToken,
          expiresAt,
        })
        return reply.code(200).send({
          redirectUrl: appendCodeToCallbackUrl(callbackUrl, code),
        })
      }

      return reply.code(200).send({ token: accessToken, refreshToken })
    },
  )
}

export default passkeyVerifyRoute
export const prefixOverride = '/auth/passkey'
