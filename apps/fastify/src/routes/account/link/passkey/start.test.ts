import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/passkey/start', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-pk@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/start',
      headers: { Origin: 'http://localhost:3000' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 400 when Origin header is missing', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/start',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_ORIGIN')
  })

  it('should return 200 with WebAuthn options when Origin is valid', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/start',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Origin: 'http://localhost:3000',
      },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body).toHaveProperty('options')
    expect(body.options).toHaveProperty('rp')
    expect(body.options).toHaveProperty('user')
    expect(body.options).toHaveProperty('challenge')
  })
})
