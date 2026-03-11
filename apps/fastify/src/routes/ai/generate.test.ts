import { createAuthenticatedUser, getApiKeyToken } from '@test/utils/auth-helper.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  skipIfInsufficientCredits,
  skipIfProviderUnavailable,
} from '../../../test/utils/ai-remote.js'
import { fastify } from './ai.spec.js'

const GenerateResponseSchema = z.object({
  text: z.string(),
})

const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})

describe('POST /ai/generate', () => {
  let testToken: string

  beforeEach(async () => {
    fastify.fakeEmail?.clear()
    const { token } = await createAuthenticatedUser(fastify)
    testToken = token
  })

  describe('POST /ai/generate — contract', () => {
    it('should return 401 when unauthenticated', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        payload: { prompt: 'Say hi' },
      })

      expect(response.statusCode).toBe(401)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('UNAUTHORIZED')
    })

    it('should return 400 for empty prompt', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: { prompt: '' },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
      expect(data.message).toBeTypeOf('string')
    })

    it('should return 400 for whitespace-only prompt', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: { prompt: '   ' },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
    })

    it('should return 400 for missing prompt field', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
    })
  })

  describe('POST /ai/generate — remote', () => {
    it('should return 200 non-streaming with text', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: { prompt: 'Say hi' },
      })

      if (skipIfInsufficientCredits(response, 'non-streaming')) return
      if (skipIfProviderUnavailable(response, 'non-streaming')) return
      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(() => GenerateResponseSchema.parse(data)).not.toThrow()
      expect(data.text).toBeTypeOf('string')
      expect(data.text.length).toBeGreaterThan(0)
    }, 60000)

    it('should return 200 streaming with SSE', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        headers: {
          Authorization: `Bearer ${testToken}`,
          Accept: 'text/event-stream',
        },
        payload: { prompt: 'Say hi', stream: true },
      })

      if (skipIfInsufficientCredits(response, 'streaming')) return
      if (skipIfProviderUnavailable(response, 'streaming', { expectStream: true })) return
      expect(response.statusCode).toBe(200)
      const contentType = response.headers['content-type']
      expect(contentType).toBeDefined()
      expect(String(contentType).toLowerCase()).toContain('text/event-stream')
      const body = response.body
      expect(body).toBeTypeOf('string')
      const lines = body.split('\n').filter(line => line.startsWith('data:'))
      expect(lines.length).toBeGreaterThan(0)
    }, 60000)

    it('should return 200 when authenticated via API key', async () => {
      const apiKey = await getApiKeyToken(fastify, 'ai-generate-apikey@test.ai')

      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/generate',
        headers: { Authorization: `Bearer ${apiKey}` },
        payload: { prompt: 'Say hi' },
      })

      if (skipIfInsufficientCredits(response, 'API key')) return
      if (skipIfProviderUnavailable(response, 'API key')) return
      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(() => GenerateResponseSchema.parse(data)).not.toThrow()
      expect(data.text).toBeTypeOf('string')
    }, 60000)
  })
})
