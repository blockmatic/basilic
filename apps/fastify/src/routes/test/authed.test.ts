import { beforeEach, describe, expect, it } from 'vitest'
import { createAuthenticatedUser } from '../../../test/utils/auth-helper.js'
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

  it('should return user info when authenticated via API key', async () => {
    const { token: jwt } = await createAuthenticatedUser(fastify)

    const createRes = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { name: 'Test Key' },
    })
    expect(createRes.statusCode).toBe(200)
    const { key } = JSON.parse(createRes.body)

    const response = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: { Authorization: `Bearer ${key}` },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user).toBeDefined()
    expect(body.user.id).toBeTruthy()
  })
})
