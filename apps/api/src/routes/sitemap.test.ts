import { describe, expect, it } from 'vitest'
import { fastify } from './discovery.spec.js'

describe('GET /sitemap.xml', () => {
  it('returns an absolute urlset without auth', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/sitemap.xml',
      headers: { host: 'api.example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/xml')
    expect(response.body).toContain('urlset')
    expect(response.body).toContain('<loc>http://api.example.com/</loc>')
    expect(response.body).toContain('<loc>http://api.example.com/.well-known/api-catalog</loc>')
    expect(response.body).toContain(
      '<loc>http://api.example.com/.well-known/oauth-protected-resource</loc>',
    )
    expect(response.body).not.toContain('robots.txt')
    expect(response.body).not.toContain('sitemap.xml')
  })
})
