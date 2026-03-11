import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../account.spec.js'

let sharedJwt: string

describe('DELETE /account/apikeys/:id', () => {
  beforeAll(async () => {
    sharedJwt = await getOrCreateSession(fastify, 'apikeys-revoke@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/account/apikeys/00000000-0000-0000-0000-000000000000',
    })
    expect(response.statusCode).toBe(401)
  })

  it('should return 404 for non-existent key', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/account/apikeys/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${sharedJwt}` },
    })
    expect(response.statusCode).toBe(404)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('NOT_FOUND')
  })

  it('should revoke key and return 204', async () => {
    const createRes = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${sharedJwt}` },
      payload: { name: 'To Revoke' },
    })
    expect(createRes.statusCode).toBe(200)
    const { id } = JSON.parse(createRes.body)

    const revokeRes = await fastify.inject({
      method: 'DELETE',
      url: `/account/apikeys/${id}`,
      headers: { Authorization: `Bearer ${sharedJwt}` },
    })
    expect(revokeRes.statusCode).toBe(204)

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${sharedJwt}` },
    })
    const body = JSON.parse(listRes.body)
    expect(body.keys).toHaveLength(0)
  })
})
