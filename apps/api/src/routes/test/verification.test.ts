import { like } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { getDb } from '../../db/index.js'
import { verification } from '../../db/schema/index.js'
import { fastify } from './test.spec.js'

describe('GET /test/verification/last', () => {
  beforeEach(async () => {
    fastify.fakeEmail?.clear?.()
    const db = await getDb()
    await db.delete(verification).where(like(verification.identifier, '%@test.ai'))
  })

  it('should return null for missing email', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/verification/last?type=magic_link',
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return null for non-test.ai email', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/verification/last?type=magic_link&email=user@example.com',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ token: null, verificationId: null })
  })

  it('should return null for invalid type', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/verification/last?type=link_email&email=test@test.ai',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ token: null, verificationId: null })
  })

  it('should return magic_link token scoped by email', async () => {
    const email = 'scoped-magic@test.ai'
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/callback' },
    })

    const response = await fastify.inject({
      method: 'GET',
      url: `/test/verification/last?type=magic_link&email=${encodeURIComponent(email)}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.token).toMatch(/^\d{6}$/)
    expect(body.verificationId).toBeTruthy()
  })

  it('should return change_email token scoped by target email', async () => {
    const jwt = await getOrCreateSession(fastify, 'e2e-email@test.ai', { clearBefore: true })
    const targetEmail = 'e2e-email-new@test.ai'

    await fastify.inject({
      method: 'POST',
      url: '/account/email/change/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: targetEmail,
        callbackUrl: 'https://example.com/auth/callback/change-email',
      },
    })

    const response = await fastify.inject({
      method: 'GET',
      url: `/test/verification/last?type=change_email&email=${encodeURIComponent(targetEmail)}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.token).toMatch(/^\d{6}$/)
    expect(body.verificationId).toBeTruthy()
  })
})

describe('GET /test/magic-link/last with email', () => {
  beforeEach(async () => {
    fastify.fakeEmail?.clear?.()
    const db = await getDb()
    await db.delete(verification).where(like(verification.identifier, '%@test.ai'))
  })

  it('should scope magic link by email when provided', async () => {
    const email = 'scoped-wrapper@test.ai'
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/callback' },
    })

    const response = await fastify.inject({
      method: 'GET',
      url: `/test/magic-link/last?email=${encodeURIComponent(email)}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.token).toMatch(/^\d{6}$/)
    expect(body.verificationId).toBeTruthy()
  })
})
