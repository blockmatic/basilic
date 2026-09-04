import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { getDb } from '../../../../db/index.js'
import { account } from '../../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../../lib/auth/index.js'
import { env } from '../../../../lib/env.js'
import { findOrCreateUserByEmail } from '../../../../lib/oauth/index.js'
import { createSessionAndIssueTokens } from '../../../../lib/session/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../../schemas.js'

const VerifyIdTokenSchema = Type.Object({
  credential: Type.String(),
})

const VerifyIdTokenResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

async function runGoogleVerifyIdTokenTx(input: {
  fastify: FastifyInstance
  db: Awaited<ReturnType<typeof getDb>>
  request: FastifyRequest
  accountId: string
  email: string
  name: string
}): Promise<{ token: string; refreshToken: string }> {
  const { fastify, db, request, accountId, email, name } = input
  const user = await findOrCreateUserByEmail(db, {
    email,
    name,
    emailVerified: true,
  })
  if (!user) throw new Error('Failed to create or find user')

  return db.transaction(async tx => {
    const linkedUserId = user.id
    const now = new Date()
    await tx
      .insert(account)
      .values({
        id: randomUUID(),
        userId: linkedUserId,
        accountId,
        providerId: 'google',
        scope: 'openid email profile',
      })
      .onConflictDoUpdate({
        target: [account.providerId, account.accountId],
        set: { userId: linkedUserId, updatedAt: now },
      })

    const { accessToken, refreshToken } = await createSessionAndIssueTokens({
      fastify,
      db: tx,
      request,
      user: { id: user.id, email: user.email, name: user.name },
      signInMethod: 'oauth_google',
    })
    return { token: accessToken, refreshToken }
  })
}

const oauthVerifyIdTokenRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify-id-token',
    {
      config: authLoginRouteConfig,
      schema: {
        operationId: 'oauthGoogleVerifyIdToken',
        description: 'Verify Google One Tap ID token and issue JWTs',
        summary: 'Google OAuth verify ID token',
        tags: ['auth'],
        security: [],
        body: VerifyIdTokenSchema,
        response: {
          200: VerifyIdTokenResponseSchema,
          400: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID
      if (!googleClientId)
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Google OAuth is not configured',
        })

      const { credential } = request.body

      const client = new OAuth2Client(googleClientId)
      let payload: {
        sub: string
        email?: string
        email_verified?: boolean
        name?: string
      }
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: googleClientId,
        })
        const p = ticket.getPayload()
        if (!p?.sub)
          return reply.code(400).send({
            code: 'INVALID_CREDENTIAL',
            message: 'Invalid Google ID token',
          })
        payload = p
      } catch {
        return reply.code(400).send({
          code: 'INVALID_CREDENTIAL',
          message: 'Failed to verify Google ID token',
        })
      }

      const accountId = payload.sub
      const email = payload.email ?? ''
      const emailVerified = !!payload.email_verified
      if (!emailVerified || !email)
        return reply.code(400).send({
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Could not retrieve verified email from Google',
        })

      const db = await getDb()
      const name = payload.name ?? email
      const result = await runGoogleVerifyIdTokenTx({
        fastify,
        db,
        request,
        accountId,
        email,
        name,
      })
      return reply.code(200).send({ token: result.token, refreshToken: result.refreshToken })
    },
  )
}

export default oauthVerifyIdTokenRoute
export const prefixOverride = '/auth/oauth/google'
