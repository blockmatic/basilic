import { getOrCreateSession, insertTestPasskey } from '@test/utils/auth-helper.js'
import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '../../../../db/index.js'
import { passkeyCredentials } from '../../../../db/schema/index.js'
import { fastify } from '../../account.spec.js'

describe('DELETE /account/link/passkey/:id', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-pk@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/passkey/00000000-0000-0000-0000-000000000000',
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 404 for non-existent passkey', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/passkey/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body).code).toBe('NOT_FOUND')
  })

  it('should return 204 when deleting owned passkey', async () => {
    const passkeyId = await insertTestPasskey(fastify, jwt)
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/account/link/passkey/${passkeyId}`,
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(204)
    const db = await getDb()
    const remaining = await db
      .select()
      .from(passkeyCredentials)
      .where(eq(passkeyCredentials.id, passkeyId))
    expect(remaining).toHaveLength(0)
  })
})
