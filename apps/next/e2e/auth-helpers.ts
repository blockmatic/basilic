import type { Page } from '@playwright/test'

const TEST_EMAIL = 'test@test.ai'
const API_URL =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

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
}
