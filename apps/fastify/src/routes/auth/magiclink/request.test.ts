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

    it('should return 400 for invalid callbackUrl (non-http scheme)', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/request',
        payload: {
          email: 'test@example.com',
          callbackUrl: 'javascript:alert(1)',
        },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toMatchObject({
        code: 'INVALID_INPUT',
        message: 'Invalid or unsafe callback URL',
      })
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
      const subjectMatch = sentEmail?.subject.match(/^(\d{6}) - .* verification code$/)
      const tokenFromEmail = fastify.fakeEmail?.extractToken(sentEmail)
      expect(subjectMatch?.[1]).toBe(tokenFromEmail)
      const magicLink = fastify.fakeEmail?.extractMagicLink(sentEmail)
      expect(magicLink).toBeTruthy()
      expect(magicLink).toContain('verificationId=')
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
      expect(magicLink).toContain('verificationId=')
      expect(magicLink).toContain('token=')
    })

    it('should extract code from email body and verificationId from link', async () => {
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
      const subjectMatch = sentEmail?.subject.match(/^(\d{6}) - .* verification code$/)
      const token = fastify.fakeEmail?.extractToken(sentEmail)
      const verificationId = fastify.fakeEmail?.extractVerificationId(sentEmail)
      expect(subjectMatch?.[1]).toBe(token)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token).toMatch(/^\d{6}$/)
      expect(verificationId).toBeTruthy()
      expect(typeof verificationId).toBe('string')
    })
  })
})
