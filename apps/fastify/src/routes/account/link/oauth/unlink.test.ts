import { randomUUID } from 'node:crypto'
import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '../../../../db/index.js'
import { account } from '../../../../db/schema/index.js'
import { fastify } from '../../account.spec.js'

describe('DELETE /account/link/oauth/:providerId', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-oauth@test.ai')
    const profileRes = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {},
    })
    const userId = (JSON.parse(profileRes.body) as { user: { id: string } }).user?.id
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
    const profileRes = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {},
    })
    const userId = (JSON.parse(profileRes.body) as { user: { id: string } }).user?.id
    if (!userId) throw new Error('No user id')
    const db = await getDb()
    const remaining = await db.select().from(account).where(eq(account.userId, userId))
    expect(remaining).toHaveLength(0)
  })
})
