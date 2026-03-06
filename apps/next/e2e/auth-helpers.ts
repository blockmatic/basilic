import type { Page } from '@playwright/test'

const testEmail = 'test@test.ai'
const apiUrl =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const apiBase = apiUrl.replace(/\/$/, '')

async function sendMagicLinkOnce(page: Page) {
  await page.goto('/auth/login')
  await page.getByRole('button', { name: /send magic link/i }).waitFor({ state: 'visible' })
  await page.fill('input[type="email"]', testEmail)
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
  testEmail,
  apiUrl,

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
