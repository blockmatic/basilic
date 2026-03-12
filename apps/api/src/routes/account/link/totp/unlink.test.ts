import { beforeAll, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

describe('DELETE /account/link/totp', () => {
  let jwtWithTotp: string
  let jwtWithoutTotp: string

  beforeAll(async () => {
    jwtWithTotp = await getOrCreateSession(fastify, 'phase2-totp-unlink@test.ai')
    await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/setup',
      headers: { Authorization: `Bearer ${jwtWithTotp}` },
    })
    const codeRes = await fastify.inject({
      method: 'GET',
      url: '/test/totp/current',
      headers: { Authorization: `Bearer ${jwtWithTotp}` },
    })
    const { code } = JSON.parse(codeRes.body) as { code: string }
    await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/verify',
      headers: { Authorization: `Bearer ${jwtWithTotp}` },
      payload: { code },
    })
    jwtWithoutTotp = await getOrCreateSession(fastify, 'phase2-totp-none@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/totp',
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 404 when TOTP not linked', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/totp',
      headers: { Authorization: `Bearer ${jwtWithoutTotp}` },
    })
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body).code).toBe('NOT_FOUND')
  })

  it('should return 204 when unlinking TOTP', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/totp',
      headers: { Authorization: `Bearer ${jwtWithTotp}` },
    })
    expect(res.statusCode).toBe(204)
  })
})
