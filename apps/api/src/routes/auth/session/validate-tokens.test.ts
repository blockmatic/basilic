import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { hashToken } from '../../../lib/jwt.js'
import { fastify } from '../session.spec.js'

async function getTokenPair(email = 'validate-tokens@example.com') {
  await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })

  const code = fastify.fakeEmail?.extractToken()
  if (!code) throw new Error('No magic link code')

  const verifyResponse = await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    payload: { email, token: code },
  })

  expect(verifyResponse.statusCode).toBe(200)
  return JSON.parse(verifyResponse.body) as { token: string; refreshToken: string }
}

function decodeJwtPayload<T extends Record<string, unknown>>(token: string) {
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Invalid JWT')
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as T
}

describe('POST /auth/session/validate-tokens', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('accepts a freshly issued matching pair for a live session', async () => {
    const { token, refreshToken } = await getTokenPair()

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${token}` },
      payload: { refreshToken },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ valid: true })
  })

  it('rejects bad signatures', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: 'Bearer not-a-jwt' },
      payload: { refreshToken: 'not-a-jwt' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('rejects swapped token types with UNAUTHORIZED', async () => {
    const { token, refreshToken } = await getTokenPair('swap-types@example.com')

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${refreshToken}` },
      payload: { refreshToken: token },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('rejects mismatched sub/sid on the refresh token with INVALID_TOKEN', async () => {
    const { token } = await getTokenPair('mismatch-a@example.com')
    const { refreshToken: foreignRefresh } = await getTokenPair('mismatch-b@example.com')

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${token}` },
      payload: { refreshToken: foreignRefresh },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('INVALID_TOKEN')
  })

  it('rejects a deleted session with UNAUTHORIZED', async () => {
    const { token, refreshToken } = await getTokenPair('deleted-session@example.com')

    const logoutResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/session/logout',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(logoutResponse.statusCode).toBe(204)

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${token}` },
      payload: { refreshToken },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('rejects an expired session with UNAUTHORIZED', async () => {
    const { token, refreshToken } = await getTokenPair('expired-session@example.com')
    const decoded = decodeJwtPayload<{ sid?: string }>(token)
    if (!decoded.sid) throw new Error('Missing session id in access token')

    const db = await getDb()
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(sessions.id, decoded.sid))

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${token}` },
      payload: { refreshToken },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('rejects a stale refresh jti with INVALID_TOKEN', async () => {
    const { refreshToken } = await getTokenPair('stale-jti@example.com')

    const refreshResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken },
    })
    expect(refreshResponse.statusCode).toBe(200)
    const { token: newToken } = JSON.parse(refreshResponse.body) as { token: string }

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${newToken}` },
      payload: { refreshToken },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('INVALID_TOKEN')
  })

  it('does not mutate the session row on success', async () => {
    const { token, refreshToken } = await getTokenPair('unchanged-session@example.com')
    const decoded = decodeJwtPayload<{ sid?: string }>(token)
    if (!decoded.sid) throw new Error('Missing session id in access token')
    const db = await getDb()

    const [before] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))
    if (!before) throw new Error('Session not found')

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/session/validate-tokens',
      headers: { authorization: `Bearer ${token}` },
      payload: { refreshToken },
    })
    expect(response.statusCode).toBe(200)

    const [after] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))
    const refreshPayload = decodeJwtPayload<{ jti?: string }>(refreshToken)
    if (!refreshPayload.jti) throw new Error('Missing jti in refresh token')
    expect(after?.token).toBe(before.token)
    expect(after?.expiresAt?.toISOString()).toBe(before.expiresAt.toISOString())
    expect(hashToken(refreshPayload.jti)).toBe(after?.token)
  })
})
