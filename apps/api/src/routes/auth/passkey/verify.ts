import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { encryptCallbackTokens } from '../../../db/callback-tokens.js'
import { getDb } from '../../../db/index.js'
import { passkeyAuthChallenges, passkeyCallback } from '../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../lib/auth/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { generateToken, hashToken } from '../../../lib/jwt.js'
import {
  AuthenticationResponseJSONSchema,
  getWebAuthnOriginFromRequest,
  verifyPasskeyAuth,
} from '../../../lib/passkey/index.js'
import { createSessionAndIssueTokensForUserId } from '../../../lib/session/index.js'
import { appendCodeToCallbackUrl, isAllowedUrl } from '../../../lib/url.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

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
      config: authLoginRouteConfig,
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
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { assertion, sessionId, callbackUrl } = request.body

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

      const db = await getDb()
      const [challengeRow] = await db
        .delete(passkeyAuthChallenges)
        .where(
          and(
            eq(passkeyAuthChallenges.sessionId, sessionId),
            gt(passkeyAuthChallenges.expiresAt, new Date()),
          ),
        )
        .returning()

      if (!challengeRow)
        return reply.code(401).send({
          code: 'EXPIRED_CHALLENGE',
          message: 'Challenge expired or not found',
        })

      const result = await verifyPasskeyAuth({
        assertion: { ...assertion, clientExtensionResults: assertion.clientExtensionResults ?? {} },
        expectedChallenge: challengeRow.challenge,
        expectedOrigin: origin.expectedOrigin,
        expectedRPID: origin.rpID,
      })

      if (!result.ok) return sendCatalogError({ reply, status: 401, code: result.code })

      if (callbackUrl) {
        const callbackOrigin = new URL(callbackUrl).origin
        const code = generateToken()
        const codeHash = hashToken(code)
        const expiresAt = new Date(Date.now() + callbackCodeExpiryMinutes * 60 * 1000)
        const { accessToken, refreshToken } = await createSessionAndIssueTokensForUserId({
          fastify,
          db,
          request,
          userId: result.userId,
          signInMethod: 'passkey',
        })
        const encrypted = encryptCallbackTokens({ accessToken, refreshToken })
        await db.insert(passkeyCallback).values({
          id: randomUUID(),
          codeHash,
          accessToken: encrypted.accessToken,
          refreshToken: encrypted.refreshToken,
          callbackOrigin,
          expiresAt,
        })
        return reply.code(200).send({
          redirectUrl: appendCodeToCallbackUrl(callbackUrl, code),
        })
      }

      const { accessToken, refreshToken } = await createSessionAndIssueTokensForUserId({
        fastify,
        db,
        request,
        userId: result.userId,
        signInMethod: 'passkey',
      })
      return reply.code(200).send({ token: accessToken, refreshToken })
    },
  )
}

export default passkeyVerifyRoute
export const prefixOverride = '/auth/passkey'
