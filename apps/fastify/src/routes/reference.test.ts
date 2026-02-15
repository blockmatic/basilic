import { describe, expect, it } from 'vitest'
import { fastify } from './reference.spec.js'

describe('GET /reference/openapi.json', () => {
  it('should return 200 with JSON content-type', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference/openapi.json',
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/json')
  })

  it('should return valid OpenAPI spec with openapi and paths', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference/openapi.json',
    })

    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('openapi')
    expect(body).toHaveProperty('paths')
    expect(typeof body.paths).toBe('object')
  })
})

describe('GET /reference', () => {
  it('should return 200 with HTML content-type', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference',
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
  })

  it('should return HTML with Scalar UI markers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference',
    })

    expect(response.body).toContain('scalar-container')
  })
})
