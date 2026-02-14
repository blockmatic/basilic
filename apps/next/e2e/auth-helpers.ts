import type { Page } from '@playwright/test'

const TEST_EMAIL = 'test@example.com'

function parseSetCookieHeader(
  header: string,
  defaultOrigin: string,
): { name: string; value: string; url: string } | null {
  const [nameVal] = header.split(';').map(s => s.trim())
  if (!nameVal) return null
  const eqIdx = nameVal.indexOf('=')
  if (eqIdx < 0) return null
  const name = nameVal.slice(0, eqIdx).trim()
  const value = nameVal.slice(eqIdx + 1).trim()
  if (!name || !value) return null
  return { name, value, url: defaultOrigin }
}
const API_URL = 'http://localhost:3001'

export const authHelpers = {
  TEST_EMAIL,
  API_URL,

  async sendMagicLink(page: Page) {
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    const [response] = await Promise.all([
      page.waitForResponse(
        resp =>
          resp.url().includes('/auth/magiclink/request') && resp.request().method() === 'POST',
      ),
      page.click('button[type="submit"]'),
    ])
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
    const base = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
    const origin = new URL(base).origin

    const [response] = await Promise.all([
      page.waitForResponse(
        resp =>
          resp.url().includes('/api/auth/magic-link/verify') &&
          resp.status() >= 300 &&
          resp.status() < 400,
      ),
      page.goto(verifyUrl),
    ])

    const headersArray = await response.headersArray()
    const setCookieValues = headersArray
      .filter(h => h.name.toLowerCase() === 'set-cookie')
      .map(h => h.value)
    if (setCookieValues.length > 0) {
      const parsed = setCookieValues
        .map(c => parseSetCookieHeader(c, origin))
        .filter((r): r is NonNullable<typeof r> => r !== null)
      if (parsed.length > 0) {
        await page.context().addCookies(parsed)
        await page.reload()
      }
    } else {
      throw new Error(
        `verifyMagicLink: no Set-Cookie in verify response (status=${response.status()}, url=${response.url()})`,
      )
    }

    await page.waitForURL(url => url.pathname === '/' || url.pathname === '', { timeout: 5000 })
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
}
