import { beforeEach, describe, expect, it } from 'vitest'
import { getSessionToken } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../account.spec.js'

describe('DELETE /account/apikeys/:id', () => {
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
    const jwt = await getSessionToken(fastify, 'apikeys-revoke@test.ai')

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/account/apikeys/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(404)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('NOT_FOUND')
  })

  it('should revoke key and return 204', async () => {
    const jwt = await getSessionToken(fastify, 'apikeys-revoke@test.ai')

    const createRes = await fastify.inject({
      method: 'POST',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { name: 'To Revoke' },
    })
    expect(createRes.statusCode).toBe(200)
    const { id } = JSON.parse(createRes.body)

    const revokeRes = await fastify.inject({
      method: 'DELETE',
      url: `/account/apikeys/${id}`,
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(revokeRes.statusCode).toBe(204)

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/account/apikeys',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const body = JSON.parse(listRes.body)
    expect(body.keys).toHaveLength(0)
  })
})
