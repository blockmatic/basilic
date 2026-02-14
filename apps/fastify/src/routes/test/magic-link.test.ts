import { like } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '../../db/index.js'
import { verification } from '../../db/schema/index.js'
import { fastify } from './test.spec.js'

describe('GET /test/magic-link/last', () => {
  beforeEach(async () => {
    fastify.fakeEmail?.clear?.()
    const db = await getDb()
    await db.delete(verification).where(like(verification.identifier, '%@test.ai'))
  })

  it('should return null when no magic link has been sent', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/magic-link/last',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toEqual({ token: null })
  })

  it('should return token after magic link is sent', async () => {
    const email = 'test@test.ai'
    const callbackUrl = 'https://example.com/callback'

    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl,
      },
    })

    const response = await fastify.inject({
      method: 'GET',
      url: '/test/magic-link/last',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.token).toBeTruthy()
    expect(typeof body.token).toBe('string')
  })
})
