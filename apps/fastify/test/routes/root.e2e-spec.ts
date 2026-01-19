import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildTestApp } from '../utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('GET /', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
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

    expect(response.body).toContain('Basilic API')
    expect(response.body).toContain('Type-safe REST API built with Fastify & OpenAPI')
    expect(response.body).toContain('/health')
    expect(response.body).toContain('/reference')
  })
})
