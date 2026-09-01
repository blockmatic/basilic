import type { Page } from '@playwright/test'

const defaultTestEmail = 'test@test.ai'
const apiUrl =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const authCookieName =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME ?? 'api.session'

type VerificationType = 'magic_link' | 'change_email'

async function sendMagicLinkOnce(page: Page, email: string) {
  await page.goto('/auth/login')
  await page.getByRole('button', { name: /send magic link/i }).waitFor({ state: 'visible' })
  await page.fill('input[type="email"]', email)
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

async function fetchVerificationLast(
  page: Page,
  { type, email }: { type: VerificationType; email: string },
) {
  const maxRetries = 8
  const delayMs = 400
  for (let attempt = 0; attempt < maxRetries; attempt++)
    try {
      const response = await page.request.get(
        `${apiUrl}/test/verification/last?type=${type}&email=${encodeURIComponent(email)}`,
      )
      if (!response.ok()) {
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delayMs))
          continue
        }
        return null
      }
      const data = (await response.json()) as {
        token?: string | null
        verificationId?: string | null
      }
      if (data.token && data.verificationId)
        return { token: data.token, verificationId: data.verificationId }
      if (data.token) return { token: data.token, verificationId: data.verificationId ?? '' }
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
}

export const authHelpers = {
  appUrl,
  apiUrl,
  testEmail: defaultTestEmail,

  async sendMagicLink(page: Page, email = defaultTestEmail) {
    let response = await sendMagicLinkOnce(page, email)
    if (!response.ok()) {
      response = await sendMagicLinkOnce(page, email)
      if (!response.ok()) await enrichError(response)
    }
    return response
  },

  async extractMagicLinkData(
    page: Page,
    email = defaultTestEmail,
  ): Promise<{ token: string; verificationId: string } | null> {
    await new Promise(r => setTimeout(r, 500))
    return fetchVerificationLast(page, { type: 'magic_link', email })
  },

  async extractChangeEmailData(
    page: Page,
    email: string,
  ): Promise<{ token: string; verificationId: string } | null> {
    await new Promise(r => setTimeout(r, 500))
    return fetchVerificationLast(page, { type: 'change_email', email })
  },

  async extractToken(page: Page, email = defaultTestEmail): Promise<string | null> {
    const data = await this.extractMagicLinkData(page, email)
    return data?.token ?? null
  },

  async enterLoginCodeAndSubmit(page: Page, code: string) {
    await page.getByTestId('login-code-input').fill(code)
    await page.getByTestId('submit-login-code').click()
  },

  async verifyMagicLink(page: Page, code: string, verificationIdParam?: string, email?: string) {
    let verificationId = verificationIdParam
    if (!verificationId) {
      const data = await this.extractMagicLinkData(page, email)
      verificationId = data?.verificationId ?? undefined
    }
    if (!verificationId) throw new Error('Need verificationId for link-click flow')
    const verifyUrl = `/auth/callback/magiclink?verificationId=${encodeURIComponent(verificationId)}&token=${encodeURIComponent(code)}&callbackURL=/`
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

  async loginAsTestUser(page: Page, email = defaultTestEmail) {
    const response = await this.sendMagicLink(page, email)
    if (response.status() !== 200) throw new Error('Magic link request failed')
    const successMessage = page.getByRole('heading', { name: 'Check your email' })
    await successMessage.waitFor({ state: 'visible', timeout: 10000 })
    await new Promise(r => setTimeout(r, 200))
    const token = await this.extractToken(page, email)
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
