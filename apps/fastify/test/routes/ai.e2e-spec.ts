import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { buildTestApp } from '../utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

// Mock the AI SDK to avoid real API calls in tests
vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai')

  // Create a ReadableStream from an async generator for streaming tests
  const createMockStream = () => {
    const encoder = new TextEncoder()
    return new ReadableStream({
      async start(controller) {
        const chunks = ['Mocked ', 'streaming ', 'response']
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk))
          // Small delay to simulate streaming
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
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  describe('success cases', () => {
    it('should return 200 with valid request and messages array', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
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
        payload: {
          messages: [],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('VALIDATION_ERROR')
      expect(data.message).toBeTypeOf('string')
    })

    it('should return 400 for invalid message structure', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
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
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for missing required messages field', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for invalid role enum value', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
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
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should return error response matching ErrorSchema', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        payload: {
          messages: [],
        },
      })

      const data = JSON.parse(response.body)
      const validated = ErrorSchema.parse(data)
      expect(validated.code).toBe('VALIDATION_ERROR')
      expect(validated.message).toBeTypeOf('string')
      expect(validated.message.length).toBeGreaterThan(0)
    })

    it('should return proper error format for Zod validation errors', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
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
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
      })
    })
  })
})

describe.skip('POST /ai/chat/stream', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  describe('success cases', () => {
    it('should return 200 for valid request', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Say hello',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(200)
    })

    it('should return Content-Type text/event-stream', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
        },
      })

      expect(response.headers['content-type']).toBe('text/event-stream')
    })

    it('should include Cache-Control no-cache header', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Test',
            },
          ],
        },
      })

      expect(response.headers['cache-control'] || response.headers['Cache-Control']).toBe(
        'no-cache',
      )
    })

    it('should include Connection keep-alive header', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Test message',
            },
          ],
        },
      })

      expect(response.headers.connection).toBe('keep-alive')
    })

    it('should return stream containing data chunks', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [
            {
              role: 'user',
              content: 'Say hi',
            },
          ],
        },
      })

      expect(response.body).toBeTypeOf('string')
      expect(response.body.length).toBeGreaterThan(0)
    })
  })

  describe('error cases', () => {
    it('should return 400 for empty messages array', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for invalid message structure', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [
            {
              wrongField: 'value',
            },
          ],
        },
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for missing required messages field', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should return error response matching ErrorSchema', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat/stream',
        payload: {
          messages: [],
        },
      })

      const data = JSON.parse(response.body)
      const validated = ErrorSchema.parse(data)
      expect(validated.code).toBe('VALIDATION_ERROR')
      expect(validated.message).toBeTypeOf('string')
    })
  })
})
