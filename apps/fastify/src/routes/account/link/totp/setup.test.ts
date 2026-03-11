import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/totp/setup', () => {
  let jwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-totp@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/setup',
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 200 with otpauthUri, manualEntryKey, qrCodeDataUrl', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/account/link/totp/setup',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body).toHaveProperty('otpauthUri')
    expect(typeof body.otpauthUri).toBe('string')
    expect(body.otpauthUri).toContain('otpauth://')
    expect(body).toHaveProperty('manualEntryKey')
    expect(typeof body.manualEntryKey).toBe('string')
    expect(body).toHaveProperty('qrCodeDataUrl')
    expect(typeof body.qrCodeDataUrl).toBe('string')
    expect(body.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/)
  })
})
