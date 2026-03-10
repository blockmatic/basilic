import type { Page } from '@playwright/test'

const testEmail = 'test@test.ai'
const apiUrl =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const authCookieName =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME ?? 'api.session'

async function sendMagicLinkOnce(page: Page) {
  await page.goto('/auth/login')
  await page.getByRole('button', { name: /send magic link/i }).waitFor({ state: 'visible' })
  await page.fill('input[type="email"]', testEmail)
  const [response] = await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes('/auth/magiclink/request') && resp.request().method() === 'POST',
      { timeout: 60_000 },
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
  appUrl,
  apiUrl,
  testEmail,

  async sendMagicLink(page: Page) {
    let response = await sendMagicLinkOnce(page)
    if (!response.ok()) {
      response = await sendMagicLinkOnce(page)
      if (!response.ok()) await enrichError(response)
    }
    return response
  },

  async extractToken(page: Page): Promise<string | null> {
    // Stabilize e2e auth flows: 500ms delay and 12 retries chosen empirically for async
    // backend/session propagation and flaky CI timing. Adjust if tests are stabilized.
    await new Promise(r => setTimeout(r, 500))
    const maxRetries = 12
    const delayMs = 500
    for (let attempt = 0; attempt < maxRetries; attempt++)
      try {
        const response = await page.request.get(`${apiUrl}/test/magic-link/last`)
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

    return null
  },

  async enterLoginCodeAndSubmit(page: Page, code: string) {
    await page.getByTestId('login-code-input').fill(code)
    await page.getByTestId('submit-login-code').click()
  },

  async verifyMagicLink(page: Page, token: string) {
    const verifyUrl = `/auth/callback/magiclink?token=${encodeURIComponent(token)}&callbackURL=/`
    await page.goto(verifyUrl)
    await page.waitForURL(
      url => {
        const path = new URL(url).pathname
        return path === '/' || path === ''
      },
      { timeout: 10000 },
    )
  },

  async extractSessionToken(page: Page): Promise<string | null> {
    const pageOrigin = new URL(page.url()).origin
    const cookies = await page.context().cookies([pageOrigin, apiUrl])
    const sessionCookie = cookies.find(c => c.name === authCookieName)
    if (!sessionCookie?.value) return null
    const rawValue = sessionCookie.value
    let parsed: { token?: string }
    try {
      parsed = JSON.parse(rawValue) as { token?: string }
    } catch {
      try {
        parsed = JSON.parse(decodeURIComponent(rawValue)) as { token?: string }
      } catch {
        return null
      }
    }
    return parsed.token ?? null
  },

  async loginAsTestUser(page: Page) {
    const response = await this.sendMagicLink(page)
    if (response.status() !== 200) throw new Error('Magic link request failed')
    const successMessage = page.getByRole('heading', { name: 'Check your email' })
    await successMessage.waitFor({ state: 'visible', timeout: 10000 })
    await new Promise(r => setTimeout(r, 200))
    const token = await this.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await this.enterLoginCodeAndSubmit(page, token)
    await page.waitForURL(
      url => {
        const path = new URL(url).pathname
        return path === '/' || path === ''
      },
      { timeout: 10000 },
    )
  },
}
