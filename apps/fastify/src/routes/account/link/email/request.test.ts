import { beforeEach, describe, expect, it } from 'vitest'
import { getApiKeyToken, getSessionToken } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/email/request', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/request',
      payload: {
        email: 'link@example.com',
        callbackUrl: 'https://example.com/callback',
      },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should send link email and return 200', async () => {
    const jwt = await getSessionToken(fastify, 'user@test.ai')
    fastify.fakeEmail?.clear()

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'link@example.com',
        callbackUrl: 'https://example.com/link-callback',
      },
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ ok: true })

    const sentEmail = fastify.fakeEmail?.last()
    expect(sentEmail).toBeDefined()
    expect(sentEmail?.to).toBe('link@example.com')
    expect(sentEmail?.subject).toBe('Link your email')
    const linkUrl = fastify.fakeEmail?.extractMagicLink(sentEmail)
    expect(linkUrl).toBeTruthy()
    expect(linkUrl).toContain('token=')
    expect(linkUrl).toContain('link-callback')
  })

  it('should return EMAIL_ALREADY_IN_USE when email belongs to another user', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email: 'other@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    const otherToken = fastify.fakeEmail?.extractToken()
    if (!otherToken) throw new Error('No token')
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token: otherToken },
    })

    const jwt = await getSessionToken(fastify, 'user@test.ai')

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'other@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    expect(response.statusCode).toBe(409)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('EMAIL_ALREADY_IN_USE')
  })

  it('should send link email when authenticated via API key', async () => {
    const apiKey = await getApiKeyToken(fastify, 'link-email-apikey@test.ai')
    fastify.fakeEmail?.clear()

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/request',
      headers: { Authorization: `Bearer ${apiKey}` },
      payload: {
        email: 'link-apikey@example.com',
        callbackUrl: 'https://example.com/link-callback',
      },
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ ok: true })
    const sentEmail = fastify.fakeEmail?.last()
    expect(sentEmail?.to).toBe('link-apikey@example.com')
  })
})
