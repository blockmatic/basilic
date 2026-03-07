import { beforeEach, describe, expect, it } from 'vitest'
import { getSessionToken } from '../../../test/utils/auth-helper.js'
import { fastify } from './test.spec.js'

describe('GET /test/totp/current', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/totp/current',
    })

    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('should return 404 when no TOTP setup in progress', async () => {
    const token = await getSessionToken(fastify, 'test@test.ai')

    const response = await fastify.inject({
      method: 'GET',
      url: '/test/totp/current',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
    const body = response.json()
    expect(body.code).toBe('NOT_FOUND')
  })

  it('should return current TOTP code when setup in progress', async () => {
    const token = await getSessionToken(fastify, 'test@test.ai')

    const setupRes = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/setup',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(setupRes.statusCode).toBe(200)

    const currentRes = await fastify.inject({
      method: 'GET',
      url: '/test/totp/current',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(currentRes.statusCode).toBe(200)
    const { code } = currentRes.json() as { code: string }
    expect(code).toMatch(/^\d{6}$/)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: { code },
    })
    expect(verifyRes.statusCode).toBe(200)

    const afterVerifyRes = await fastify.inject({
      method: 'GET',
      url: '/test/totp/current',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(afterVerifyRes.statusCode).not.toBe(200)
    const afterBody = afterVerifyRes.json() as { code?: string }
    expect(afterBody.code).toBeUndefined()
  })
})
