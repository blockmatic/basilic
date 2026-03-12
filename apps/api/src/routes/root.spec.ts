import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('GET /', () => {
  let fastify: TestApp

  beforeAll(async () => {
    await setupGroupDatabase()
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    if (fastify) await fastify.close()
    await cleanupGroupDatabase()
  })

  it('should return HTML with status 200', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    })

    expect(response.statusCode).toBe(200)
  })

  it('should return Content-Type text/html', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    })

    expect(response.headers['content-type']).toContain('text/html')
  })

  it('should contain expected HTML content', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    })

    expect(response.body).toContain('Basilic Fastify API')
    expect(response.body).toContain('Type-safe REST API built with Fastify & OpenAPI')
    expect(response.body).toContain('/health')
    expect(response.body).toContain('/reference')
  })
})
