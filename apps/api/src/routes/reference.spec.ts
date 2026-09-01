import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'

describe('GET /reference', () => {
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
      url: '/reference',
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.body).toContain('scalar')
  })

  it('should return OpenAPI JSON at /reference/openapi.json', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference/openapi.json',
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/json')
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('openapi')
    expect(body).toHaveProperty('paths')
  })
})
