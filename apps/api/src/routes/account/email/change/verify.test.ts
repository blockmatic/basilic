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

  it('should return INVALID_PAYLOAD when both email and verificationId are provided', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        token: '123456',
        email: 'new@test.ai',
        verificationId: '00000000-0000-0000-0000-000000000001',
      },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_PAYLOAD')
  })

  it('should return INVALID_PAYLOAD when neither email nor verificationId is provided', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: '123456' },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_PAYLOAD')
  })

  it('should verify via verificationId path', async () => {
    const xorJwt = await getOrCreateSession(fastify, 'change-xor@test.ai', { clearBefore: true })
    await fastify.inject({
      method: 'POST',
      url: '/account/email/change/request',
      headers: { Authorization: `Bearer ${xorJwt}` },
      payload: {
        email: 'link-path@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    const sent = fastify.fakeEmail?.last()
    const token = sent ? fastify.fakeEmail?.extractToken(sent) : null
    const verificationId = sent ? fastify.fakeEmail?.extractVerificationId(sent) : null
    if (!token || !verificationId) throw new Error('Missing token or verificationId')

    const res = await fastify.inject({
      method: 'POST',
      url: '/account/email/change/verify',
      headers: { Authorization: `Bearer ${xorJwt}` },
      payload: { token, verificationId },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
  })

  it('should return 200 with new tokens and update user email', async () => {
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

    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${body.token}` },
    })
    expect(userRes.statusCode).toBe(200)
    expect(userRes.json().user.email).toBe('verified-new@test.ai')
  })
})
