import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/totp/verify', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-totp@test.ai')
    await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/setup',
      headers: { Authorization: `Bearer ${jwt}` },
    })
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/verify',
      payload: { code: '123456' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 400 for invalid code', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { code: '000000' },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_CODE')
  })

  it('should return 200 when code is valid', async () => {
    const codeRes = await fastify.inject({
      method: 'GET',
      url: '/test/totp/current',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(codeRes.statusCode).toBe(200)
    const { code } = JSON.parse(codeRes.body) as { code: string }
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { code },
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ ok: true })
  })
})
