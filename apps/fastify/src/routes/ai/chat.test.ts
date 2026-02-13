import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createAuthenticatedUser } from '../../../test/utils/auth-helper.js'
import { fastify } from './ai.spec.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

const ChatResponseSchema = z.object({
  text: z.string(),
})

const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})

describe('POST /ai/chat', () => {
  let testToken: string

  beforeEach(async () => {
    fastify.fakeEmail?.clear()
    const { token } = await createAuthenticatedUser(fastify)
    testToken = token
  })

  it('should return 200 with stream (SSE data stream protocol)', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/ai/chat',
      headers: {
        Authorization: `Bearer ${testToken}`,
        Accept: 'text/event-stream',
      },
      payload: {
        messages: [{ role: 'user', content: 'Hello, say hi' }],
        stream: true,
      },
    })

    expect(response.statusCode).toBe(200)
    const contentType = response.headers['content-type']
    expect(contentType).toBeDefined()
    expect(String(contentType).toLowerCase()).toContain('text/event-stream')
    const body = response.body
    expect(body).toBeTypeOf('string')
    const lines = body.split('\n').filter(line => line.startsWith('data:'))
    expect(lines.length).toBeGreaterThan(0)
    const firstData = lines[0]!.replace(/^data:\s*/, '')
    if (firstData !== '[DONE]') {
      const parsed = JSON.parse(firstData) as { type?: string }
      expect(parsed.type).toBeDefined()
      expect(['start', 'text-start', 'text-delta', 'text-end', 'finish', 'finish-step']).toContain(
        parsed.type,
      )
    }
  })

  it('should return 200 with default model (Aurora Alpha via Open Router)', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/ai/chat',
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      payload: {
        messages: [{ role: 'user', content: 'Hello, say hi' }],
      },
    })

    expect(response.statusCode).toBe(200)
    const data = JSON.parse(response.body)
    expect(() => ChatResponseSchema.parse(data)).not.toThrow()
    expect(data.text).toBeTypeOf('string')
    expect(data.text.length).toBeGreaterThan(0)
  })

  it('should accept UIMessage format (useChat payload)', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/ai/chat',
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      payload: {
        messages: [
          {
            id: 'msg-test-1',
            role: 'user',
            parts: [{ type: 'text', text: 'Say hi in one word' }],
          },
        ],
      },
    })

    expect(response.statusCode).toBe(200)
    const data = JSON.parse(response.body)
    expect(() => ChatResponseSchema.parse(data)).not.toThrow()
    expect(data.text).toBeTypeOf('string')
  })

  describe('error cases', () => {
    it('should return 401 when unauthenticated', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/ai/chat',
        payload: {
          messages: [{ role: 'user', content: 'Hello' }],
        },
      })

      expect(response.statusCode).toBe(401)
      const data = JSON.parse(response.body)
      expect(() => ErrorSchema.parse(data)).not.toThrow()
      expect(data.code).toBe('UNAUTHORIZED')
    })

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
  })
})
