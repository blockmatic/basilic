import { beforeAll, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/passkey/finish', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-pk@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/finish',
      headers: { Origin: 'http://localhost:3000' },
      payload: {
        credential: {
          id: 'x',
          rawId: 'x',
          response: { clientDataJSON: '', attestationObject: '' },
          type: 'public-key',
        },
      },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return EXPIRED_CHALLENGE when no registration challenge exists', async () => {
    const isolatedJwt = await getOrCreateSession(fastify, 'phase2-pk-finish-expired@test.ai')
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/finish',
      headers: {
        Authorization: `Bearer ${isolatedJwt}`,
        Origin: 'http://localhost:3000',
      },
      payload: {
        credential: {
          id: 'invalid',
          rawId: 'invalid',
          response: { clientDataJSON: '', attestationObject: '' },
          type: 'public-key',
        },
      },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('EXPIRED_CHALLENGE')
  })

  it('should return VERIFICATION_FAILED when challenge exists but credential is invalid', async () => {
    const startRes = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/start',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Origin: 'http://localhost:3000',
      },
    })
    expect(startRes.statusCode).toBe(200)

    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/passkey/finish',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Origin: 'http://localhost:3000',
      },
      payload: {
        credential: {
          id: 'invalid',
          rawId: 'invalid',
          response: { clientDataJSON: '', attestationObject: '' },
          type: 'public-key',
        },
      },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('VERIFICATION_FAILED')
  })
})
