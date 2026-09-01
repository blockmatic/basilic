import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../../../test/utils/auth-helper.js'
import { getDb } from '../../../../db/index.js'
import { account, users } from '../../../../db/schema/index.js'
import { fastify } from '../../account.spec.js'

describe('DELETE /account/link/oauth/:providerId', () => {
  let jwt: string
  let userId: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-oauth@test.ai')
    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    userId = (JSON.parse(userRes.body) as { user: { id: string } }).user?.id
    if (!userId) throw new Error('No user id')
    const db = await getDb()
    await db.insert(account).values({
      id: randomUUID(),
      userId,
      accountId: `oauth-test-${randomUUID()}`,
      providerId: 'github',
      accessToken: null,
      refreshToken: null,
    })
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/oauth/github',
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 400 when provider not linked', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/oauth/google',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('NOT_LINKED')
  })

  it('should return 204 when unlinking OAuth provider', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/oauth/github',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(204)
    const db = await getDb()
    const remaining = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, 'github')))
    expect(remaining).toHaveLength(0)
  })

  it('should return 400 LAST_SIGN_IN_METHOD when unlinking only OAuth provider', async () => {
    const lastJwt = await getOrCreateSession(fastify, 'oauth-last@test.ai', { clearBefore: true })
    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${lastJwt}` },
    })
    const lastUserId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id
    const db = await getDb()
    await db.insert(account).values({
      id: randomUUID(),
      userId: lastUserId,
      accountId: `oauth-last-${randomUUID()}`,
      providerId: 'google',
      accessToken: null,
      refreshToken: null,
    })
    await db.update(users).set({ email: null }).where(eq(users.id, lastUserId))

    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/oauth/google',
      headers: { Authorization: `Bearer ${lastJwt}` },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('LAST_SIGN_IN_METHOD')
  })
})
