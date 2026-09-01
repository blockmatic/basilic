import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getStoredMagicLink } from '../../test/utils/auth-helper.js'
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
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('openapi')
    expect(body).toHaveProperty('paths')
  })
})
