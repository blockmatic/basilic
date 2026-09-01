import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('GET /health', () => {
  let fastify: TestApp

  beforeAll(async () => {
    await setupGroupDatabase()
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    if (fastify) await fastify.close()
    await cleanupGroupDatabase()
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
      dbReady: expect.any(Boolean),
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

  it('should return dbReady field as boolean', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    const data = JSON.parse(response.body)

    expect(typeof data.dbReady).toBe('boolean')
  })

  it('should validate response against HealthResponseSchema', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    const data = JSON.parse(response.body)

    expect(data.ok).toBe(true)
    expect(typeof data.dbReady).toBe('boolean')
  })

  it('should include security headers but not HSTS in non-production', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('DENY')
    expect(response.headers['strict-transport-security']).toBeUndefined()
  })
})
