import { beforeEach, describe, expect, it } from 'vitest'
import { getApiKeyToken, getSessionToken } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../account.spec.js'

describe('POST /account/apikeys', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      payload: { name: 'My Key' },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should create API key and return it once', async () => {
    const jwt = await getSessionToken(fastify, 'apikeys-create@test.ai')

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
    fastify.fakeEmail?.clear()
    const apiKey = await getApiKeyToken(fastify, 'apikeys-create-apikey@test.ai')

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
