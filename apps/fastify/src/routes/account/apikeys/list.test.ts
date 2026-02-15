import { beforeEach, describe, expect, it } from 'vitest'
import { getApiKeyToken, getSessionToken } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../account.spec.js'

describe('GET /account/apikeys', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
    })
    expect(response.statusCode).toBe(401)
  })

  it('should return empty keys for user with no keys', async () => {
    const jwt = await getSessionToken(fastify, 'apikeys-list@test.ai')

    const response = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.keys).toEqual([])
  })

  it('should list created keys without secret', async () => {
    const jwt = await getSessionToken(fastify, 'apikeys-list@test.ai')

    const createRes = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { name: 'Staging' },
    })
    expect(createRes.statusCode).toBe(200)
    const created = JSON.parse(createRes.body)

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(listRes.statusCode).toBe(200)
    const body = JSON.parse(listRes.body)
    expect(body.keys).toHaveLength(1)
    expect(body.keys[0]).toMatchObject({
      id: created.id,
      name: 'Staging',
      prefix: created.prefix,
    })
    expect(body.keys[0]).not.toHaveProperty('key')
    expect(body.keys[0]).not.toHaveProperty('hash')
  })

  it('should list keys when authenticated via API key', async () => {
    fastify.fakeEmail?.clear()
    const apiKey = await getApiKeyToken(fastify, 'apikeys-list-apikey@test.ai')

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    expect(listRes.statusCode).toBe(200)
    const body = JSON.parse(listRes.body)
    expect(body.keys).toHaveLength(1)
    expect(body.keys[0].name).toBe('Test Key')
    expect(body.keys[0]).not.toHaveProperty('key')
  })
})
