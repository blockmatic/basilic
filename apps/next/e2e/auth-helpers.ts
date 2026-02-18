import type { Page } from '@playwright/test'

const TEST_EMAIL = 'test@test.ai'
const API_URL =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const APP_URL =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const apiBase = API_URL.replace(/\/$/, '')

async function sendMagicLinkOnce(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: /send magic link/i }).waitFor({ state: 'visible' })
  await page.fill('input[type="email"]', TEST_EMAIL)
  const [response] = await Promise.all([
    page.waitForResponse(
      resp =>
        resp.url().startsWith(`${apiBase}/auth/magiclink/request`) &&
        resp.request().method() === 'POST',
    ),
    page.click('button[type="submit"]'),
  ])
  return response
}

async function enrichError(response: Awaited<ReturnType<typeof sendMagicLinkOnce>>) {
  const status = response.status()
  const url = response.url()
  let body: string
  try {
    body = await response.text()
  } catch {
    body = '(unable to read body)'
  }
  throw new Error(
    `Magic link request failed: status=${status} url=${url} body=${body.slice(0, 500)}`,
  )
}

export const authHelpers = {
  TEST_EMAIL,
  API_URL,

  async sendMagicLink(page: Page) {
    let response = await sendMagicLinkOnce(page)
    if (!response.ok()) {
      response = await sendMagicLinkOnce(page)
      if (!response.ok()) await enrichError(response)
    }
    return response
  },

  async extractToken(page: Page): Promise<string | null> {
    const maxRetries = 5
    const delayMs = 500
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await page.request.get(`${API_URL}/test/magic-link/last`)
        if (!response.ok()) {
          if (attempt < maxRetries - 1) {
            await new Promise(r => setTimeout(r, delayMs))
            continue
          }
          return null
        }
        const data = await response.json()
        if (data.token) return data.token
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delayMs))
          continue
        }
        return null
      } catch {
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delayMs))
          continue
        }
        return null
      }
    }
    return null
  },

  async verifyMagicLink(page: Page, token: string) {
    const verifyUrl = `/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&callbackURL=/`
    await page.goto(verifyUrl)
    await page.waitForURL(
      url => {
        const path = new URL(url).pathname
        return path === '/' || path === ''
      },
      { timeout: 10000 },
    )
  },

  async loginAsTestUser(page: Page) {
    const response = await this.sendMagicLink(page)
    if (response.status() !== 200) throw new Error('Magic link request failed')
    const successMessage = page.getByText(/check your email for the magic link/i)
    await successMessage.waitFor({ state: 'visible', timeout: 10000 })
    await new Promise(r => setTimeout(r, 200))
    const token = await this.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await this.verifyMagicLink(page, token)
  },

  /**
   * E2E-only: login via direct Fastify verify + test-set-session to inject cookies.
   * Bypasses magic-link verify redirect when cookie propagation fails (e.g. storageState).
   */
  async loginAsTestUserWithTokenInjection(page: Page) {
    const response = await this.sendMagicLink(page)
    if (response.status() !== 200) throw new Error('Magic link request failed')
    const successMessage = page.getByText(/check your email for the magic link/i)
    await successMessage.waitFor({ state: 'visible', timeout: 10000 })
    await new Promise(r => setTimeout(r, 200))
    const magicToken = await this.extractToken(page)
    if (!magicToken) throw new Error('Failed to extract magic link token')

    const verifyRes = await page.request.post(`${API_URL}/auth/magiclink/verify`, {
      data: { token: magicToken },
    })
    if (!verifyRes.ok()) throw new Error(`Magic link verify failed: ${verifyRes.status()}`)
    const { token, refreshToken } = (await verifyRes.json()) as {
      token: string
      refreshToken: string
    }
    if (!token || !refreshToken) throw new Error('Verify response missing token')

    const injectUrl = `${APP_URL}/api/auth/test-set-session?${new URLSearchParams({
      token,
      refreshToken,
    })}`
    await page.goto(injectUrl)
    await page.waitForURL(
      url => {
        const path = new URL(url).pathname
        return path === '/' || path === ''
      },
      { timeout: 10000 },
    )
  },
}
