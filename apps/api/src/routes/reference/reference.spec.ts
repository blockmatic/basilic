import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getStoredMagicLink } from '../../../test/utils/auth-helper.js'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../test/utils/db-setup.js'
import type { TestApp } from '../../../test/utils/fastify.js'
import { buildTestApp } from '../../../test/utils/fastify.js'

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

  it('should return markdown when Accept is text/markdown', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference',
      headers: { accept: 'text/markdown' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/markdown')
    expect(response.body).toContain('# API reference')
    expect(response.body).toContain('/openapi.json')
    expect(response.body).not.toContain('/reference/openapi.json')
    expect(response.body).not.toContain('scalar')
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

  it('should embed jwtFromServer when magic link callback succeeds', async () => {
    const email = 'scalar-jwt@test.ai'
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/reference' },
    })
    const { token, verificationId } = await getStoredMagicLink(email)
    if (!token || !verificationId) throw new Error('Missing magic link params')

    const response = await fastify.inject({
      method: 'GET',
      url: `/reference?token=${token}&verificationId=${verificationId}`,
    })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('jwtFromServer')
    expect(response.body).not.toContain('jwtFromServer = null')
  })

  it('should return OpenAPI JSON at /reference/openapi.json', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/reference/openapi.json',
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.headers.vary).toContain('Accept')
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('openapi')
    expect(body).toHaveProperty('paths')
    expect(body.info.title).toBe('Basilic API')
  })

  it('should return OpenAPI JSON at /openapi.json', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/openapi.json',
      headers: { host: 'api.example.com' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.headers.vary).toContain('Accept')
    const body = JSON.parse(response.body) as {
      openapi: string
      paths: Record<string, unknown>
      servers: { url: string }[]
      info: { title: string }
    }
    expect(body).toHaveProperty('openapi')
    expect(body).toHaveProperty('paths')
    expect(body.info.title).toBe('Basilic API')
    expect(body.servers[0]?.url).toBe('http://api.example.com')
    expect(Object.keys(body.paths)).not.toContain('/openapi.json')
  })

  it('should prefer application/openapi+json when Accept asks', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/openapi.json',
      headers: { accept: 'application/openapi+json', host: 'api.example.com' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('application/openapi+json')
    expect(response.headers.vary).toContain('Accept')
  })

  it('should match title and path keys on the alias', async () => {
    const canonical = await fastify.inject({
      method: 'GET',
      url: '/openapi.json',
    })
    const alias = await fastify.inject({
      method: 'GET',
      url: '/reference/openapi.json',
    })
    expect(canonical.statusCode).toBe(200)
    const canonicalBody = JSON.parse(canonical.body) as {
      info: { title: string }
      paths: Record<string, unknown>
    }
    const aliasBody = JSON.parse(alias.body) as {
      info: { title: string }
      paths: Record<string, unknown>
    }
    expect(aliasBody.info.title).toBe(canonicalBody.info.title)
    expect(Object.keys(aliasBody.paths)).toEqual(Object.keys(canonicalBody.paths))
  })
})
