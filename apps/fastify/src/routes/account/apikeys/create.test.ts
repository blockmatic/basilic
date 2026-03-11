import { describe, expect, it } from 'vitest'
import { getApiKeyToken, getOrCreateSession } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../account.spec.js'

describe('POST /account/apikeys', () => {
  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      payload: { name: 'My Key' },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should create API key and return it once', async () => {
    const jwt = await getOrCreateSession(fastify, 'apikeys-shared@test.ai')

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { name: 'Production' },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.id).toBeDefined()
    expect(body.name).toBe('Production')
    expect(body.key).toMatch(/^bask_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+$/)
    expect(body.prefix).toBeDefined()
    expect(body.createdAt).toBeDefined()
  })

  it('should create API key when authenticated via API key', async () => {
    const apiKey = await getApiKeyToken(fastify, 'apikeys-shared@test.ai')

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${apiKey}` },
      payload: { name: 'Second Key' },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.id).toBeDefined()
    expect(body.name).toBe('Second Key')
    expect(body.key).toMatch(/^bask_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+$/)
  })
})
