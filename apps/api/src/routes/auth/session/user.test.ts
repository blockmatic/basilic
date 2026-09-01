import { beforeEach, describe, expect, it } from 'vitest'
import { createAuthenticatedUser, getWeb3Session } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../session.spec.js'

describe('GET /auth/session/user', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
    })

    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('should return user with linkedWallets when authenticated', async () => {
    const { token, email } = await createAuthenticatedUser(fastify)

    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user).toBeDefined()
    expect(body.user.id).toBeTruthy()
    expect(body.user.email).toBe(email)
    expect(body.user.emailVerified).toBe(true)
    expect(Array.isArray(body.user.linkedWallets)).toBe(true)
    expect(Array.isArray(body.user.linkedAccounts)).toBe(true)
    expect(typeof body.user.totpEnabled).toBe('boolean')
    expect(Array.isArray(body.user.passkeys)).toBe(true)
  })

  it('should return emailVerified false for web3-authenticated session', async () => {
    const token = await getWeb3Session(fastify)

    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user.emailVerified).toBe(false)
  })

  it('should return user when authenticated via API key', async () => {
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
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${key}` },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user).toBeDefined()
    expect(body.user.id).toBeTruthy()
    expect(Array.isArray(body.user.linkedWallets)).toBe(true)
  })
})
