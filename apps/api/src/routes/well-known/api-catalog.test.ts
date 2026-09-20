import { describe, expect, it } from 'vitest'
import { fastify } from '../discovery.spec.js'

describe('GET /.well-known/api-catalog', () => {
  it('returns an RFC 9727 linkset without auth', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/.well-known/api-catalog',
      headers: { host: 'api.example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/linkset+json')
    expect(response.body).toContain('linkset')

    const body = JSON.parse(response.body) as {
      linkset: {
        anchor: string
        'service-desc': { href: string }[]
        'service-doc': { href: string }[]
        status: { href: string }[]
      }[]
    }
    const context = body.linkset[0]
    const hrefs = [
      context.anchor,
      ...context['service-desc'].map(item => item.href),
      ...context['service-doc'].map(item => item.href),
      ...context.status.map(item => item.href),
    ]
    for (const href of hrefs) expect(href.startsWith('http')).toBe(true)
  })

  it('does not serve the undotted catalog path', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/well-known/api-catalog',
    })

    expect(response.statusCode).toBe(404)
  })
})
