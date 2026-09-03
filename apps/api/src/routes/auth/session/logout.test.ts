import { beforeEach, describe, expect, it } from 'vitest'
import { getApiKeyToken } from '../../../../test/utils/auth-helper.js'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { fastify } from './session.spec.js'

describe('POST /auth/session/logout', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 when not authenticated', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/session/logout',
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should logout user, return empty 204, delete session, and reject Bearer', async () => {
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
    expect(logoutResponse.body).toBe('')

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

  it('should return 400 USE_KEY_REVOKE for API key auth', async () => {
    const apiKey = await getApiKeyToken(fastify, 'logout-apikey@test.ai')

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/session/logout',
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('USE_KEY_REVOKE')
  })
})
