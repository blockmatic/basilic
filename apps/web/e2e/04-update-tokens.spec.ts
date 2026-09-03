import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const authCookieName =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME ?? 'api.session'

const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const sameOrigin = new URL(appUrl).origin

type HeadersArrayResponse = {
  headersArray: () => { name: string; value: string }[] | Promise<{ name: string; value: string }[]>
}

async function setCookieHeaders(response: HeadersArrayResponse) {
  const headers = await response.headersArray()
  return headers.filter(h => h.name.toLowerCase() === 'set-cookie').map(h => h.value)
}

async function hasAuthSessionSetCookie(response: HeadersArrayResponse) {
  const prefix = `${authCookieName}=`
  return (await setCookieHeaders(response)).some(value => value.startsWith(prefix))
}

function parseSessionCookieValue(setCookieValue: string) {
  const match = setCookieValue.match(new RegExp(`^${authCookieName}=([^;]+)`, 'i'))
  if (!match?.[1]) return null
  try {
    return JSON.parse(decodeURIComponent(match[1])) as {
      token?: string
      refreshToken?: string
    }
  } catch {
    try {
      return JSON.parse(match[1]) as { token?: string; refreshToken?: string }
    } catch {
      return null
    }
  }
}

test.describe('POST /api/auth/update-tokens', () => {
  test('sets validated session cookie on first login', async ({ page }) => {
    const updateTokensResponse = page.waitForResponse(
      resp => resp.url().includes('/api/auth/update-tokens') && resp.request().method() === 'POST',
      { timeout: 60_000 },
    )

    await authHelpers.loginAsTestUser(page)

    const response = await updateTokensResponse
    expect(response.status()).toBe(200)

    const sessionHeader = (await setCookieHeaders(response)).find(value =>
      value.toLowerCase().startsWith(`${authCookieName.toLowerCase()}=`),
    )
    expect(sessionHeader).toBeDefined()

    const parsed = parseSessionCookieValue(sessionHeader ?? '')
    expect(parsed?.token).toMatch(/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/)
    expect(parsed?.refreshToken).toMatch(/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/)
  })

  test('returns 400 for missing fields', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: sameOrigin, 'Content-Type': 'application/json' },
      data: { token: 'only-token' },
    })

    expect(response.status()).toBe(400)
    expect(await hasAuthSessionSetCookie(response)).toBe(false)
  })

  test('returns 401 for garbage tokens without setting session cookie', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: sameOrigin, 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(401)
    expect(await hasAuthSessionSetCookie(response)).toBe(false)
  })

  test('returns 403 for foreign Origin', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { Origin: 'https://evil.example.com', 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(403)
    expect(await hasAuthSessionSetCookie(response)).toBe(false)
  })

  test('returns 403 when Origin is absent', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: { 'Content-Type': 'application/json' },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(403)
    expect(await hasAuthSessionSetCookie(response)).toBe(false)
  })

  test('returns 403 for cross-site Sec-Fetch-Site', async ({ request }) => {
    const response = await request.post('/api/auth/update-tokens', {
      headers: {
        Origin: sameOrigin,
        'Sec-Fetch-Site': 'cross-site',
        'Content-Type': 'application/json',
      },
      data: { token: 'garbage-access', refreshToken: 'garbage-refresh' },
    })

    expect(response.status()).toBe(403)
    expect(await hasAuthSessionSetCookie(response)).toBe(false)
  })
})
