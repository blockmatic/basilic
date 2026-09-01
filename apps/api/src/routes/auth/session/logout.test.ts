import { beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { fastify } from '../session.spec.js'

describe('POST /auth/session/logout', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should logout user, return 204, delete session, and reject Bearer', async () => {
    const email = 'logout@test.ai'

    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl: 'https://example.com/callback',
      },
    })

    const token = fastify.fakeEmail?.extractToken()
    expect(token).toBeTruthy()

    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })

    const { token: jwtToken } = JSON.parse(verifyResponse.body)
    expect(jwtToken).toBeTruthy()

    const logoutResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/session/logout',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })

    expect(logoutResponse.statusCode).toBe(204)

    const db = await getDb()
    const remainingSessions = await db.select().from(sessions)
    expect(remainingSessions).toHaveLength(0)

    const authedResponse = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
    expect(authedResponse.statusCode).toBe(401)
  })
})
