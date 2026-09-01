import { expect, test } from '@playwright/test'

const authCookieName =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME ?? 'api.session'

const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const sameOrigin = new URL(appUrl).origin

function sessionSetCookie(headers: Record<string, string>) {
  const raw = headers['set-cookie'] ?? headers['Set-Cookie']
  if (!raw) return undefined
  return Array.isArray(raw) ? raw.join('; ') : raw
}

test.describe('POST /api/auth/update-tokens', () => {
  test('returns 400 for missing fields', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: sameOrigin, 'Content-Type': 'application/json' },
      data: { token: 'only-token' },
    })

    expect(response.status()).toBe(400)
    expect(sessionSetCookie(response.headers())).toBeUndefined()
  })

  test('returns 401 for garbage tokens', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: sameOrigin, 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(401)
    const setCookie = sessionSetCookie(response.headers())
    expect(setCookie).toBeUndefined()
  })

  test('returns 403 for foreign Origin', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: 'https://evil.example.com', 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(403)
    const setCookie = sessionSetCookie(response.headers())
    expect(setCookie).toBeUndefined()
  })

  test('returns 403 when Origin is absent', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(403)
    const setCookie = sessionSetCookie(response.headers())
    expect(setCookie).toBeUndefined()
  })

  test('does not set session cookie on 401', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: sameOrigin, 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(401)
    const setCookie = sessionSetCookie(response.headers()) ?? ''
    expect(setCookie.includes(`${authCookieName}=`)).toBe(false)
  })
})
