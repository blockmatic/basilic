import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
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

  it('should return 400 when credential is invalid or challenge expired', async () => {
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
    const body = JSON.parse(res.body)
    expect(['EXPIRED_CHALLENGE', 'VERIFICATION_FAILED']).toContain(body.code)
  })
})
