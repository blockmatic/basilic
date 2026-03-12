import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../link.spec.js'

describe('POST /auth/magiclink/request', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should send magic link email', async () => {
    const email = 'test@example.com'

    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl: 'https://example.com/callback',
      },
    })

    expect(response.statusCode).toBe(200)
    const sentEmail = fastify.fakeEmail?.last()
    expect(sentEmail).toBeDefined()
    expect(sentEmail?.to).toBe(email)
  })

  it('should return 400 for invalid email', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email: 'invalid-email',
        callbackUrl: 'https://example.com/callback',
      },
    })

    expect(response.statusCode).toBe(400)
  })
})
