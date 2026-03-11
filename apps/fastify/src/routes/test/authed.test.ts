import { createApiKey, createAuthenticatedUser } from '@test/utils/auth-helper.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from './test.spec.js'

describe('GET /test/authed', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
    })

    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('should return user info when authenticated', async () => {
    const { token, email } = await createAuthenticatedUser(fastify)

    const response = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user).toBeDefined()
    expect(body.user.id).toBeTruthy()
    expect(body.user.email).toBe(email)
  })

  it('should return 200 when authenticated via X-API-Key', async () => {
    const { token, email } = await createAuthenticatedUser(fastify)
    const sessionRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(sessionRes.statusCode).toBe(200)
    const { user } = sessionRes.json() as { user: { id: string } }
    const apiKey = await createApiKey(fastify, user.id)

    const response = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: { 'X-API-Key': apiKey },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe(email)
  })
})
