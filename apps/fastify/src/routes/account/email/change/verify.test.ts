import { beforeAll, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

describe('POST /account/email/change/verify', () => {
  let jwt: string
  let verificationCode: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-email@test.ai')
    await fastify.inject({
      method: 'POST',
      url: '/account/email/change/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'verified-new@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    const sent = fastify.fakeEmail?.last()
    verificationCode = sent ? (fastify.fakeEmail?.extractToken(sent) ?? '') : ''
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/verify',
      payload: { token: '123456', email: 'verified-new@test.ai' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 200 with new tokens when code is valid', async () => {
    if (!verificationCode) throw new Error('No verification code from email change request')
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: verificationCode, email: 'verified-new@test.ai' },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
  })
})
