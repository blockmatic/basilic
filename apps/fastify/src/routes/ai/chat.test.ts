import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { fastify } from './ai.spec.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai')

  const createMockStream = () => {
    const encoder = new TextEncoder()
    return new ReadableStream({
      async start(controller) {
        const chunks = ['Mocked ', 'streaming ', 'response']
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk))
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        controller.close()
      },
    })
  }

  return {
    ...actual,
    generateText: vi.fn().mockResolvedValue({
      text: 'Mocked AI response',
      usage: { promptTokens: 10, completionTokens: 5 },
      finishReason: 'stop' as const,
    }),
    streamText: vi.fn().mockReturnValue({
      textStream: createMockStream(),
    }),
  }
})

const ChatResponseSchema = z.object({
  text: z.string(),
})

const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})

describe.skip('POST /ai/chat', () => {
  let testToken: string

  beforeEach(async () => {
    const email = 'test@example.com'
    const requestResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl: 'https://example.com/callback',
      },
    })
    expect(requestResponse.statusCode).toBe(200)

    const token = fastify.fakeEmail?.extractToken()
    expect(token).toBeTruthy()

    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token },
    })
    expect(verifyResponse.statusCode).toBe(200)

    const body = JSON.parse(verifyResponse.body)
    expect(body).toHaveProperty('token')
    testToken = body.token
  })

  describe('success cases', () => {
    it('should return 200 with valid request and messages array', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Hello, say hi',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(() => ChatResponseSchema.parse(data)).not.toThrow()
      expect(data.text).toBeTypeOf('string')
      expect(data.text.length).toBeGreaterThan(0)
    })

    it('should return response matching ChatResponseSchema', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Say hello',
            },
          ],
        },
      })

      const data = JSON.parse(response.body)
      const validated = ChatResponseSchema.parse(data)
      expect(validated.text).toBeTypeOf('string')
    })

    it('should accept optional model parameter', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
          model: 'gpt-4o-mini',
        },
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.text).toBeTypeOf('string')
    })

    it('should use default model when not provided', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Test message',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.text).toBeTypeOf('string')
    })
  })

  describe('error cases', () => {
    it('should return 400 for empty messages array', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
      expect(data.message).toBeTypeOf('string')
    })

    it('should return 400 for invalid message structure', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              invalidField: 'value',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
    })

    it('should return 400 for missing required messages field', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
    })

    it('should return 400 for invalid role enum value', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              role: 'invalid-role',
              content: 'Test',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('BAD_REQUEST')
    })

    it('should return error response matching ErrorSchema', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [],
        },
      })

      const data = JSON.parse(response.body)
      const validated = ErrorSchema.parse(data)
      expect(validated.code).toBe('BAD_REQUEST')
      expect(validated.message).toBeTypeOf('string')
      expect(validated.message.length).toBeGreaterThan(0)
    })

    it('should return proper error format for Zod validation errors', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
        payload: {
          messages: [
            {
              role: 'user',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(data).toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.any(String),
      })
    })
  })
})
