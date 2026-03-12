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
    const response = await page.request.get(`${apiUrl}/test/magic-link/last`)
    if (!response.ok()) return null

    const data = (await response.json()) as { token?: string; verificationId?: string }
    if (data.token && data.verificationId)
      return { token: data.token, verificationId: data.verificationId }
    return null
  } catch {
    return null
  }
}

test.describe('Scalar UI Login Flow', () => {
  test.describe.configure({ mode: 'serial' })

  test('should complete full login flow through Scalar UI', async ({ page }) => {
    // Step 1: Navigate to Scalar UI
    await page.goto(`${apiUrl}/reference`)
    await page.waitForLoadState('networkidle')

    // Step 2: Wait for Scalar UI to load and login button to be injected
    const loginButton = page.locator('[data-login-link]')
    await expect(loginButton).toBeVisible({ timeout: 10000 })
    await expect(loginButton).toHaveText('Login')

    // Step 3: Click login button to open dialog
    await loginButton.click()

    // Step 4: Wait for modal to appear (vanilla modal)
    const modalOverlay = page.locator('#modal-overlay.show')
    await expect(modalOverlay).toBeVisible({ timeout: 5000 })

    // Step 5: Enter email in the form
    const emailInput = page.locator('#email')
    await expect(emailInput).toBeVisible()
    await emailInput.fill(testEmail)

    // Step 6: Submit form to request magic link
    const submitButton = page.locator('#submit-button')
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    // Step 7: Wait for success message
    const successMessage = page.locator('#email-success')
    await expect(successMessage).toBeVisible({ timeout: 10000 })
    await expect(successMessage).toHaveText('Check your email for the magic link')

    // Step 8: Extract token and verificationId from test endpoint
    const magicLink = await extractMagicLinkData(page)
    expect(magicLink).toBeTruthy()
    if (!magicLink) throw new Error('Failed to extract magic link token and verificationId')

    // Step 9: Open callback URL with token+verificationId (server verifies and returns HTML with JWT)
    const callbackUrl = `${apiUrl}/reference?token=${magicLink.token}&verificationId=${magicLink.verificationId}`
    await page.goto(callbackUrl)
    await page.waitForLoadState('networkidle')

    // Step 10: Wait for callback page to process and clean URL (template does history.replaceState)
    await page.waitForURL(/\/reference$/, { timeout: 15000 })

    // Step 11: Check that token is stored in localStorage
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('scalar-token'))
    expect(tokenInStorage).toBeTruthy()

    // Step 12: Wait for page to reload and verify login button text changed to "Logout"
    await page.waitForLoadState('networkidle')
    const logoutButton = page.locator('[data-login-link]')
    await expect(logoutButton).toBeVisible({ timeout: 10000 })
    await expect(logoutButton).toHaveText('Logout', { timeout: 5000 })

    // Step 13: Verify we can call the authenticated endpoint directly with the token
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
    // First, login (reuse logic from previous test)
    await page.goto(`${apiUrl}/reference`)
    await page.waitForLoadState('networkidle')

    const loginButton = page.locator('[data-login-link]')
    await expect(loginButton).toBeVisible({ timeout: 10000 })
    await loginButton.click()

    // Wait for modal
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

    const callbackUrl = `${apiUrl}/reference?token=${magicLink.token}&verificationId=${magicLink.verificationId}`
    await page.goto(callbackUrl)
    await page.waitForURL(/\/reference$/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify logged in state
    const logoutButton = page.locator('[data-login-link]')
    await expect(logoutButton).toBeVisible({ timeout: 10000 })
    await expect(logoutButton).toHaveText('Logout', { timeout: 5000 })

    // Click logout
    await logoutButton.click()

    // Verify page reloads and token is cleared
    await page.waitForLoadState('networkidle')
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('scalar-token'))
    expect(tokenAfterLogout).toBeNull()

    // Verify login button is back
    const loginButtonAfterLogout = page.locator('[data-login-link]')
    await expect(loginButtonAfterLogout).toBeVisible({ timeout: 10000 })
    await expect(loginButtonAfterLogout).toHaveText('Login')
  })
})
