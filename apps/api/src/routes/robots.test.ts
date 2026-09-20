import { describe, expect, it } from 'vitest'
import { fastify } from './discovery.spec.js'

describe('GET /robots.txt', () => {
  it('returns Allow rules as text/plain without auth', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/robots.txt',
      headers: { host: 'api.example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.body).toContain('Allow:')
    expect(response.body).toContain('Sitemap: http://api.example.com/sitemap.xml')
  })
})
