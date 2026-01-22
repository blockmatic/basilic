import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildTestApp } from '../utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

// Mock Resend to avoid real API calls in tests
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => {
      return {
        emails: {
          send: vi.fn().mockResolvedValue({
            data: {
              id: 'mock-email-id',
            },
            error: null,
          }),
        },
      }
    }),
  }
})

describe('Magic Link Authentication', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  describe('Magic Link Request', () => {
    it('should have magic link endpoint available', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/auth/sign-in/magic-link',
        payload: {
          email: 'test@example.com',
        },
      })

      // Magic link endpoint should exist and return 200
      // Migrations are run in vitest.setup.ts beforeAll, so verification table should exist
      expect(response.statusCode).toBe(200)
    })

    it('should return 400 for invalid email format', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/auth/sign-in/magic-link',
        payload: {
          email: 'invalid-email',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toMatchObject({
        code: expect.stringMatching(/VALIDATION_ERROR|FST_ERR_VALIDATION|INVALID_INPUT/),
        message: expect.any(String),
      })
    })

    it('should return 400 for missing email', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/auth/sign-in/magic-link',
        payload: {},
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
