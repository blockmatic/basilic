import { expect, test } from '@playwright/test'

const testEmail = 'test@test.ai'
const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001'

/**
 * Extract magic link token and verificationId from test endpoint for callback URL
 */
async function extractMagicLinkData(
  page: ReturnType<typeof test>['page'],
): Promise<{ token: string; verificationId: string } | null> {
  try {
    const response = await page.request.get(
      `${apiUrl}/test/magic-link/last?email=${encodeURIComponent(testEmail)}`,
    )
    if (!response.ok()) return null

    const data = (await response.json()) as { token?: string; verificationId?: string }
    if (data.token && data.verificationId)
      return { token: data.token, verificationId: data.verificationId }
    return null
  } catch {
    return null
  }
}

/** Magic-link callback: replaceState clears token query; Scalar may add a hash — avoid strict full-URL match. */
async function waitForReferenceAuthSettled(
  page: ReturnType<typeof test>['page'],
  { timeoutMs = 20_000 } = {},
) {
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const u = new URL(window.location.href)
          return (
            Boolean(localStorage.getItem('scalar-token')) &&
            u.pathname === '/reference' &&
            !u.searchParams.has('token')
          )
        }),
      { timeout: timeoutMs },
    )
    .toBe(true)
}

test.describe('Scalar UI Login Flow', () => {
  test.describe.configure({ mode: 'serial' })

  test('should complete full login flow through Scalar UI', async ({ page }) => {
    await page.goto(`${apiUrl}/reference`)
    await page.waitForLoadState('networkidle')

    const loginButton = page.locator('[data-login-link]')
    await expect(loginButton).toBeVisible({ timeout: 10000 })
    await expect(loginButton).toHaveText('Login')

    await loginButton.click()

    const modalOverlay = page.locator('#modal-overlay.show')
    await expect(modalOverlay).toBeVisible({ timeout: 5000 })

    const emailInput = page.locator('#email')
    await expect(emailInput).toBeVisible()
    await emailInput.fill(testEmail)

    const submitButton = page.locator('#submit-button')
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    const successMessage = page.locator('#email-success')
    await expect(successMessage).toBeVisible({ timeout: 10000 })
    await expect(successMessage).toHaveText('Check your email for the magic link')

    const magicLink = await extractMagicLinkData(page)
    expect(magicLink).toBeTruthy()
    if (!magicLink) throw new Error('Failed to extract magic link token and verificationId')

    const callbackUrl = new URL(`${apiUrl}/reference`)
    callbackUrl.searchParams.set('token', magicLink.token)
    callbackUrl.searchParams.set('verificationId', magicLink.verificationId)
    await page.goto(callbackUrl.toString())
    await page.waitForLoadState('networkidle')

    await waitForReferenceAuthSettled(page)

    const tokenInStorage = await page.evaluate(() => localStorage.getItem('scalar-token'))
    expect(tokenInStorage).toBeTruthy()

    await page.waitForLoadState('networkidle')
    const logoutButton = page.locator('[data-login-link]')
    await expect(logoutButton).toBeVisible({ timeout: 10000 })
    await expect(logoutButton).toHaveText('Logout', { timeout: 5000 })

    const authedResponse = await page.request.get(`${apiUrl}/test/authed`, {
      headers: {
        authorization: `Bearer ${tokenInStorage}`,
      },
    })

    expect(authedResponse.ok()).toBeTruthy()
    const authedData = await authedResponse.json()
    expect(authedData.user).toBeDefined()
    expect(authedData.user.email).toBe(testEmail)
  })

  test('should handle logout correctly', async ({ page }) => {
    await page.goto(`${apiUrl}/reference`)
    await page.waitForLoadState('networkidle')

    const loginButton = page.locator('[data-login-link]')
    await expect(loginButton).toBeVisible({ timeout: 10000 })
    await loginButton.click()

    const modalOverlay = page.locator('#modal-overlay.show')
    await expect(modalOverlay).toBeVisible({ timeout: 5000 })

    const emailInput = page.locator('#email')
    await emailInput.fill(testEmail)

    const submitButton = page.locator('#submit-button')
    await submitButton.click()

    const successMessage = page.locator('#email-success')
    await expect(successMessage).toBeVisible({ timeout: 10000 })
    await expect(successMessage).toHaveText('Check your email for the magic link')

    const magicLink = await extractMagicLinkData(page)
    if (!magicLink) throw new Error('Failed to extract magic link token and verificationId')

    const callbackUrl = new URL(`${apiUrl}/reference`)
    callbackUrl.searchParams.set('token', magicLink.token)
    callbackUrl.searchParams.set('verificationId', magicLink.verificationId)
    await page.goto(callbackUrl.toString())
    await waitForReferenceAuthSettled(page)
    await page.waitForLoadState('networkidle')

    const logoutButton = page.locator('[data-login-link]')
    await expect(logoutButton).toBeVisible({ timeout: 10000 })
    await expect(logoutButton).toHaveText('Logout', { timeout: 5000 })

    await logoutButton.click()

    await page.waitForLoadState('networkidle')
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('scalar-token'))
    expect(tokenAfterLogout).toBeNull()

    const loginButtonAfterLogout = page.locator('[data-login-link]')
    await expect(loginButtonAfterLogout).toBeVisible({ timeout: 10000 })
    await expect(loginButtonAfterLogout).toHaveText('Login')
  })
})
