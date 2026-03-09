import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, sessions, users, verification } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
  state: Type.String(),
})

const ExchangeResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

type FacebookTokenResponse = {
  access_token: string
  token_type: string
  expires_in?: number
}

type FacebookUser = { id: string; name?: string; email?: string }

const oauthExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      schema: {
        operationId: 'oauthFacebookExchange',
        description: 'Exchange Facebook OAuth code for JWTs',
        summary: 'Facebook OAuth exchange',
        tags: ['auth'],
        security: [],
        body: ExchangeSchema,
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
          503: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const facebookClientId = env.FACEBOOK_CLIENT_ID
      const facebookClientSecret = env.FACEBOOK_CLIENT_SECRET
      const oauthFacebookCallbackUrl = env.OAUTH_FACEBOOK_CALLBACK_URL
      if (!facebookClientId || !facebookClientSecret || !oauthFacebookCallbackUrl)
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Facebook OAuth is not configured',
        })

      const { code, state } = request.body
      const stateHash = hashToken(state)

      const db = await getDb()
      const [stateRecord] = await db
        .select()
        .from(verification)
        .where(and(eq(verification.value, stateHash), eq(verification.type, 'oauth_state')))

      if (!stateRecord)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Invalid or expired state',
        })

      if (stateRecord.expiresAt < new Date()) {
        await db.delete(verification).where(eq(verification.id, stateRecord.id))
        return reply.code(401).send({
          code: 'EXPIRED_STATE',
          message: 'State has expired',
        })
      }

      await db.delete(verification).where(eq(verification.id, stateRecord.id))

      const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
      tokenUrl.searchParams.set('client_id', facebookClientId)
      tokenUrl.searchParams.set('client_secret', facebookClientSecret)
      tokenUrl.searchParams.set('redirect_uri', oauthFacebookCallbackUrl)
      tokenUrl.searchParams.set('code', code)

      const fetchTimeoutMs = 15_000
      let tokenRes: Response
      try {
        tokenRes = await fetch(tokenUrl.toString(), {
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError')
          return reply.code(504).send({
            code: 'TOKEN_EXCHANGE_FAILED',
            message: 'Token exchange timed out',
          })
        throw err
      }
      if (!tokenRes.ok)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: 'Failed to exchange code for token',
        })

      const tokenData = (await tokenRes.json()) as FacebookTokenResponse & {
        error?: { message: string }
      }
      if (tokenData.error)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: tokenData.error?.message ?? 'Token exchange failed',
        })

      const accessToken = tokenData.access_token
      if (!accessToken)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: 'No access token in response',
        })

      const userUrl = new URL('https://graph.facebook.com/me')
      userUrl.searchParams.set('fields', 'id,name,email')
      userUrl.searchParams.set('access_token', accessToken)

      let userRes: Response
      try {
        userRes = await fetch(userUrl.toString(), {
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError')
          return reply.code(504).send({
            code: 'USER_INFO_FAILED',
            message: 'Failed to fetch Facebook user (timeout)',
          })
        throw err
      }
      if (!userRes.ok)
        return reply.code(400).send({
          code: 'USER_INFO_FAILED',
          message: 'Failed to fetch Facebook user',
        })

      const fbUser = (await userRes.json()) as FacebookUser
      const accountId = fbUser.id
      const email = fbUser.email ?? ''
      const name = fbUser.name ?? 'Facebook user'

      if (!email)
        return reply.code(400).send({
          code: 'EMAIL_REQUIRED',
          message: 'Could not retrieve email from Facebook',
        })

      await db
        .insert(users)
        .values({
          id: randomUUID(),
          email,
          emailVerified: true,
          name,
        })
        .onConflictDoNothing({ target: users.email })
      const [user] = await db.select().from(users).where(eq(users.email, email))
      if (!user)
        return reply.code(500).send({
          code: 'USER_CREATE_FAILED',
          message: 'Failed to create or find user',
        })

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'facebook'), eq(account.accountId, accountId)))

      const accountData = {
        id: existingAccount?.id ?? randomUUID(),
        userId: user.id,
        accountId,
        providerId: 'facebook',
        accessToken,
        refreshToken: null as string | null,
        idToken: null as string | null,
        accessTokenExpiresAt: new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000),
        refreshTokenExpiresAt: null as Date | null,
        scope: 'email,public_profile',
      }

      if (existingAccount) {
        const encrypted = encryptAccountTokens({
          accessToken: accountData.accessToken,
          updatedAt: new Date(),
        })
        await db
          .update(account)
          .set({
            accessToken: encrypted.accessToken,
            updatedAt: encrypted.updatedAt ?? new Date(),
          })
          .where(eq(account.id, existingAccount.id))
      } else {
        const toInsert = encryptAccountTokens({
          id: accountData.id,
          userId: accountData.userId,
          accountId: accountData.accountId,
          providerId: accountData.providerId,
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          idToken: accountData.idToken,
          accessTokenExpiresAt: accountData.accessTokenExpiresAt,
          refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
          scope: accountData.scope,
        })
        await db.insert(account).values(toInsert)
      }

      const sessionId = randomUUID()
      const refreshJti = generateJti()
      const refreshJtiHash = hashToken(refreshJti)
      const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        token: refreshJtiHash,
        expiresAt: sessionExpiresAt,
      })

      const accessPayload = createAccessTokenPayload({ userId: user.id, sessionId })
      const refreshPayload = createRefreshTokenPayload({
        userId: user.id,
        sessionId,
        jti: refreshJti,
      })

      const jwtAccess = fastify.jwt.sign(accessPayload, {
        expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
      })
      const jwtRefresh = fastify.jwt.sign(refreshPayload, {
        expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
      })

      return reply.code(200).send({
        token: jwtAccess,
        refreshToken: jwtRefresh,
      })
    },
  )
}

export default oauthExchangeRoute
export const prefixOverride = '/auth/oauth/facebook'
