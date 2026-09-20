import { describe, expect, it } from 'vitest'
import { fastify } from '../discovery.spec.js'

describe('GET /.well-known/oauth-protected-resource', () => {
  it('returns RFC 9728 resource metadata without an authorization server', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/.well-known/oauth-protected-resource',
      headers: { host: 'api.example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.body).toContain('bearer_methods_supported')
    expect(response.body).not.toContain('authorization_servers')
    expect(response.body).not.toContain('jwks_uri')
  })

  it('does not serve the undotted protected-resource path', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/well-known/oauth-protected-resource',
    })

    expect(response.statusCode).toBe(404)
  })
})
