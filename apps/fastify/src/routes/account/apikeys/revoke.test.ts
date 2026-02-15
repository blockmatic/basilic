import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getSessionToken } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../account.spec.js'

let sharedJwt: string

describe('DELETE /account/apikeys/:id', () => {
  beforeAll(async () => {
    fastify.fakeEmail?.clear()
    sharedJwt = await getSessionToken(fastify, 'apikeys-revoke@test.ai')
  })

  beforeEach(() => {
    fastify.fakeEmail?.clear()
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

  // TODO: 500 when revoking with API key auth - debug PGLite/delete interaction
  it.skip('should revoke key when authenticated via API key', async () => {
    const createRes1 = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${sharedJwt}` },
      payload: { name: 'First Key' },
    })
    expect(createRes1.statusCode).toBe(200)
    const { key: firstKey } = JSON.parse(createRes1.body) as { key: string }

    const createRes2 = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${firstKey}` },
      payload: { name: 'Second Key' },
    })
    expect(createRes2.statusCode).toBe(200)
    const { id: secondId } = JSON.parse(createRes2.body)

    const revokeRes = await fastify.inject({
      method: 'DELETE',
      url: `/account/apikeys/${secondId}`,
      headers: { Authorization: `Bearer ${firstKey}` },
    })
    expect(revokeRes.statusCode).toBe(204)

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${firstKey}` },
    })
    const body = JSON.parse(listRes.body)
    expect(body.keys).toHaveLength(1)
    expect(body.keys[0].name).toBe('First Key')
  })
})
