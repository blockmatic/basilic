import { describe, expect, it } from 'vitest'
import { fastify } from './discovery.spec.js'

describe('discovery OpenAPI hide', () => {
  it('omits discovery files from swagger paths', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference/openapi.json',
    })
    expect(response.statusCode).toBe(200)
    const spec = JSON.parse(response.body) as { paths?: Record<string, unknown> }
    const paths = Object.keys(spec.paths ?? {})
    expect(paths).not.toContain('/robots.txt')
    expect(paths).not.toContain('/sitemap.xml')
    expect(paths).not.toContain('/llms.txt')
    expect(paths).not.toContain('/openapi.json')
    expect(paths.some(path => path.includes('well-known'))).toBe(false)
  })
})
