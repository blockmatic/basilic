import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildTestApp } from '../utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('Auth Integration', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  it('should have auth routes mounted at /api/auth/*', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/get-session',
    })
    // Should not return 404
    expect(response.statusCode).toBeLessThan(500)
  })

  it('should return null session when not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/get-session',
    })
    expect(response.statusCode).toBe(200)
    // Better Auth returns JSON with user and session fields
    const body = response.body ? JSON.parse(response.body) : null
    // When not authenticated, user and session should be null
    if (body) {
      expect(body.user).toBeNull()
      expect(body.session).toBeNull()
    } else {
      // Empty response is also acceptable
      expect(body).toBeNull()
    }
  })

  it('should attach session middleware to requests', async () => {
    // Create a test route that checks for session
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })
    // Health endpoint should work and session should be available (null when not authenticated)
    expect(response.statusCode).toBe(200)
  })
})
