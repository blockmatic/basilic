import { describe, expect, it } from 'vitest'
import { fastify } from './discovery.spec.js'

describe('GET /llms.txt', () => {
  it('states auth facts and no MCP without auth', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/llms.txt',
      headers: { host: 'api.example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.body).toContain('no MCP')
    expect(response.body).toContain('bask_')
    expect(response.body).toContain('http://api.example.com/.well-known/api-catalog')
  })
})
