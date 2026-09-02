import { randomUUID } from 'node:crypto'
import { and, eq, gt } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getMagicLinkTokenRaw } from '../../../../test/utils/auth-helper.js'
import { getDb } from '../../../db/index.js'
import { sessions, users } from '../../../db/schema/index.js'
import { env } from '../../../lib/env.js'
import { hashToken } from '../../../lib/jwt.js'
import { fastify } from '../session.spec.js'

function decodeJwtPayload<T extends Record<string, unknown>>(token: string) {
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Invalid JWT')
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as T
}

describe('POST /auth/session/refresh', () => {
  it('should refresh token and return 200 { token, refreshToken }', async () => {
    const email = 'refresh-happy@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })

    const { token: jwtToken, refreshToken } = JSON.parse(verifyResponse.body)
    expect(jwtToken).toBeTruthy()
    expect(refreshToken).toBeTruthy()

    const refreshResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: {
        refreshToken,
      },
    })

    expect(refreshResponse.statusCode).toBe(200)
    const refreshBody = JSON.parse(refreshResponse.body)
    expect(refreshBody).toHaveProperty('token')
    expect(refreshBody).toHaveProperty('refreshToken')
    expect(typeof refreshBody.token).toBe('string')
    expect(typeof refreshBody.refreshToken).toBe('string')
  })

  it('should return TOKEN_REUSE_DETECTED and revoke session on refresh replay', async () => {
    const email = 'refresh-reuse@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    const { refreshToken: originalRefresh } = JSON.parse(verifyRes.body) as { refreshToken: string }

    const firstRefresh = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: originalRefresh },
    })
    expect(firstRefresh.statusCode).toBe(200)

    const reuseRes = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: originalRefresh },
    })
    expect(reuseRes.statusCode).toBe(401)
    expect(JSON.parse(reuseRes.body).code).toBe('TOKEN_REUSE_DETECTED')

    const { refreshToken: rotatedRefresh } = JSON.parse(firstRefresh.body) as {
      refreshToken: string
    }
    const afterRevoke = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: rotatedRefresh },
    })
    expect(afterRevoke.statusCode).toBe(401)
    expect(JSON.parse(afterRevoke.body).code).toBe('SESSION_NOT_FOUND')
  })

  it('should return INVALID_TOKEN when access token is used as refresh token', async () => {
    const email = 'refresh-access-as-refresh@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    const { token: accessToken } = JSON.parse(verifyRes.body) as { token: string }

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: accessToken },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('INVALID_TOKEN')
  })

  it('should return INVALID_TOKEN and revoke session when userId does not match JWT sub', async () => {
    const email = 'refresh-user-mismatch@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    const { refreshToken } = JSON.parse(verifyRes.body) as { refreshToken: string }
    const decoded = decodeJwtPayload<{ sid?: string }>(refreshToken)
    const sessionId = decoded.sid
    if (!sessionId) throw new Error('Missing sid')

    const db = await getDb()
    const otherUserId = randomUUID()
    await db.insert(users).values({
      id: otherUserId,
      email: 'other-user@test.ai',
      username: `other-${Date.now()}`,
    })
    await db.update(sessions).set({ userId: otherUserId }).where(eq(sessions.id, sessionId))

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('INVALID_TOKEN')

    const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId))
    expect(row).toBeUndefined()

    await db.delete(users).where(eq(users.id, otherUserId))
  })

  it('should not rotate session when CAS update matches stale jti hash', async () => {
    const email = 'refresh-cas-stale@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    const { refreshToken } = JSON.parse(verifyRes.body) as { refreshToken: string }
    const decoded = decodeJwtPayload<{ sub?: string; sid?: string; jti?: string }>(refreshToken)
    if (!decoded.sub || !decoded.sid || !decoded.jti) throw new Error('Missing refresh claims')

    const oldJtiHash = hashToken(decoded.jti)
    const db = await getDb()

    const firstRefresh = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken },
    })
    expect(firstRefresh.statusCode).toBe(200)

    const staleCas = await db
      .update(sessions)
      .set({
        token: hashToken('stale-jti'),
        expiresAt: new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000),
      })
      .where(
        and(
          eq(sessions.id, decoded.sid),
          eq(sessions.token, oldJtiHash),
          eq(sessions.userId, decoded.sub),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .returning()

    expect(staleCas).toHaveLength(0)
  })
})
