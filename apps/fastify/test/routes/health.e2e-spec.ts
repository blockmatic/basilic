import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildTestApp } from '../utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('GET /health', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  it('should return 200 status', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
  })

  it('should return response matching schema structure', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    const data = JSON.parse(response.body)

    expect(data).toMatchObject({
      ok: true,
      now: expect.any(String),
    })
  })

  it('should return ok field as true', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    const data = JSON.parse(response.body)

    expect(data.ok).toBe(true)
  })

  it('should return now field as valid ISO datetime string', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    const data = JSON.parse(response.body)

    expect(data.now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    expect(() => new Date(data.now)).not.toThrow()
    expect(new Date(data.now).toISOString()).toBe(data.now)
  })

  it('should validate response against HealthResponseSchema', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    const data = JSON.parse(response.body)

    // Fastify validates automatically using TypeBox schema
    // This test verifies the response structure matches the schema
    expect(data.ok).toBe(true)
    expect(typeof data.now).toBe('string')
    // Verify ISO datetime format
    expect(data.now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})
