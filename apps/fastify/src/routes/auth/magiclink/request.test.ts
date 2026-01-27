import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../magiclink.spec.js'

describe('POST /auth/magiclink/request', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  describe('Email Validation', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          email: 'invalid-email',
          callbackUrl: 'https://example.com/callback',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toMatchObject({
        code: expect.stringMatching(
          /BAD_REQUEST|VALIDATION_ERROR|FST_ERR_VALIDATION|INVALID_INPUT/,
        ),
        message: expect.any(String),
      })
    })

    it('should return 400 for missing email', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          callbackUrl: 'https://example.com/callback',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should return 400 for missing callbackUrl', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          email: 'test@example.com',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('Send Magic Link', () => {
    it('should send magic link email and capture it in fake outbox', async () => {
      const email = 'test@example.com'

      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          email,
          callbackUrl: 'https://example.com/callback',
        },
      })

      expect(response.statusCode).toBe(200)

      const sentEmail = fastify.fakeEmail?.last()
      expect(sentEmail).toBeDefined()
      expect(sentEmail?.to).toBe(email)
      expect(sentEmail?.subject).toBe('Sign in to your account')
      const magicLink = fastify.fakeEmail?.extractMagicLink(sentEmail)
      expect(magicLink).toBeTruthy()
      expect(magicLink).toContain('token=')
    })

    it('should extract magic link URL from email', async () => {
      const email = 'test@example.com'

      await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          email,
          callbackUrl: 'https://example.com/callback',
        },
      })

      const sentEmail = fastify.fakeEmail?.last()
      expect(sentEmail).toBeDefined()

      const magicLink = fastify.fakeEmail?.extractMagicLink(sentEmail)
      expect(magicLink).toBeTruthy()
      expect(magicLink).toContain('callback')
      expect(magicLink).toContain('token=')
    })

    it('should extract token from magic link URL', async () => {
      const email = 'test@example.com'

      await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          email,
          callbackUrl: 'https://example.com/callback',
        },
      })

      const token = fastify.fakeEmail?.extractToken()
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token?.length).toBeGreaterThan(0)
    })
  })
})
