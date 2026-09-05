import * as emailRender from '@repo/email/render'
import { describe, expect, it, vi } from 'vitest'
import { getStoredMagicLink } from '../../../../test/utils/auth-helper.js'
import { allowlistedWebAppOrigin } from '../../../lib/session/index.js'
import { fastify } from './sessions.spec.js'

const chromeUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const firefoxUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'

async function login({ email, userAgent }: { email: string; userAgent?: string }) {
  const requestRes = await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  expect(requestRes.statusCode).toBe(200)
  const { token } = await getStoredMagicLink(email)
  return fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    headers: userAgent ? { 'user-agent': userAgent } : undefined,
    payload: { email, token },
  })
}

function newDeviceMails(email: string) {
  return (fastify.fakeEmail?.all() ?? []).filter(
    e => e.to === email && e.subject.includes('New device'),
  )
}

describe('new-device notify', () => {
  it('skips email when WEB_APP_URL origin is not allowlisted', () => {
    expect(allowlistedWebAppOrigin('http://evil.example')).toBeNull()
    expect(allowlistedWebAppOrigin('http://localhost:3000')).toBe('http://localhost:3000')
  })

  it('persists IP, UA, and fingerprint and emails the first device', async () => {
    const email = 'sessions-notify-first@test.ai'
    const verifyRes = await login({ email, userAgent: chromeUa })
    expect(verifyRes.statusCode).toBe(200)
    const { token: jwt } = JSON.parse(verifyRes.body) as { token: string }

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/auth/sessions',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(listRes.statusCode).toBe(200)
    const { sessions } = JSON.parse(listRes.body) as {
      sessions: Array<{ deviceLabel: string | null; ipAddress: string | null }>
    }
    expect(sessions[0]?.deviceLabel).toBe('Chrome on macOS')
    expect(sessions[0]?.ipAddress).toBeTruthy()

    const mail = await vi.waitFor(() => {
      const found = newDeviceMails(email).at(-1)
      expect(found).toBeDefined()
      return found
    })
    expect(mail?.html).toContain('Chrome on macOS')
    expect(mail?.html).toContain('Email code')
    expect(mail?.html).toContain('/auth/session/revoke')
    expect(mail?.text).toBeTruthy()
    expect(fastify.fakeEmail?.extractToken(mail)).toBeTruthy()
    expect(fastify.fakeEmail?.extractVerificationId(mail)).toBeTruthy()
  })

  it('does not email a second login with the same fingerprint', async () => {
    const email = 'sessions-notify-same@test.ai'
    const first = await login({ email, userAgent: chromeUa })
    expect(first.statusCode).toBe(200)
    await vi.waitFor(() => expect(newDeviceMails(email).length).toBe(1))

    const second = await login({ email, userAgent: chromeUa })
    expect(second.statusCode).toBe(200)
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(newDeviceMails(email).length).toBe(1)
  })

  it('emails when the fingerprint differs', async () => {
    const email = 'sessions-notify-diff@test.ai'
    const first = await login({ email, userAgent: chromeUa })
    expect(first.statusCode).toBe(200)
    await vi.waitFor(() => expect(newDeviceMails(email).length).toBe(1))

    const second = await login({ email, userAgent: firefoxUa })
    expect(second.statusCode).toBe(200)
    await vi.waitFor(() => expect(newDeviceMails(email).length).toBe(2))
  })

  it('emails when the user-agent is missing', async () => {
    const email = 'sessions-notify-empty-ua@test.ai'
    const verifyRes = await login({ email })
    expect(verifyRes.statusCode).toBe(200)
    await vi.waitFor(() => expect(newDeviceMails(email).length).toBe(1))
  })

  it('does not crash the process when notification render rejects', async () => {
    const spy = vi.spyOn(emailRender, 'render').mockRejectedValue(new Error('render failed'))
    const email = 'sessions-notify-render-fail@test.ai'
    try {
      const verifyRes = await login({ email, userAgent: chromeUa })
      expect(verifyRes.statusCode).toBe(200)
      await new Promise(resolve => setTimeout(resolve, 50))
    } finally {
      spy.mockRestore()
    }
  })
})
