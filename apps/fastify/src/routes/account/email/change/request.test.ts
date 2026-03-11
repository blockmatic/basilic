import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../../account.spec.js'

describe('POST /account/email/change/request', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-email@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/request',
      payload: {
        email: 'new@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 400 for invalid callback URL', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'new@test.ai',
        callbackUrl: 'javascript:alert(1)',
      },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_INPUT')
  })

  it('should return 200 and send verification email', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'changed@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ ok: true })
    const sent = fastify.fakeEmail?.last()
    expect(sent).toBeDefined()
    expect(sent?.to).toBe('changed@test.ai')
  })
})
