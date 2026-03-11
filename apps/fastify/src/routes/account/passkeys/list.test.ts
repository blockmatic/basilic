import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../account.spec.js'

describe('GET /account/passkeys', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-shared@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/account/passkeys' })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 200 with empty passkeys array when none configured', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/account/passkeys',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body).toHaveProperty('passkeys')
    expect(Array.isArray(body.passkeys)).toBe(true)
    expect(body.passkeys).toHaveLength(0)
  })
})
