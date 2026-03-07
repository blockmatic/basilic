import { authHelpers } from '../auth-helpers'
import { expect, test } from '../fixtures'

test.describe('Security - Authenticator', () => {
  test.describe.configure({ mode: 'serial' })

  test('should redirect to login when unauthenticated', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/settings/security?section=totp')
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('should reach page and see layout when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings/security?section=totp')
    await expect(authenticatedPage).toHaveURL(/\/settings\/security/)
    await expect(authenticatedPage.getByRole('tab', { name: /passkeys/i })).toBeVisible()
    await expect(authenticatedPage.getByRole('tab', { name: /authenticator/i })).toBeVisible()
    await expect(authenticatedPage.getByRole('tab', { name: /api keys/i })).toBeVisible()
    await expect(authenticatedPage.getByText('Authenticator app')).toBeVisible()
  })

  test('should show setup flow with QR and InputOTP when TOTP not configured', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/settings/security?section=totp')
    await expect(authenticatedPage.getByText('Authenticator app')).toBeVisible({ timeout: 10000 })
    await expect(authenticatedPage.getByText(/scan qr code/i)).toBeVisible({ timeout: 15000 })
    await expect(authenticatedPage.locator('[data-slot="input-otp-group"]')).toBeVisible({
      timeout: 5000,
    })
    await expect(authenticatedPage.getByRole('button', { name: /cancel/i })).toBeVisible()
    await expect(authenticatedPage.getByRole('button', { name: /verify/i })).toBeVisible()
  })

  test('should complete full TOTP setup and unlink', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings/security?section=totp')
    await expect(authenticatedPage.getByText('Authenticator app')).toBeVisible({ timeout: 10000 })
    await expect(authenticatedPage.getByText(/scan qr code/i)).toBeVisible({ timeout: 15000 })

    const token = await authHelpers.extractSessionToken(authenticatedPage)
    if (!token) throw new Error('Failed to extract session token')
    const res = await authenticatedPage.request.get(`${authHelpers.apiUrl}/test/totp/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok()) {
      const body = await res.text()
      throw new Error(`TOTP current failed: ${res.status()} ${body}`)
    }
    const { code } = (await res.json()) as { code: string }
    if (!code || code.length !== 6) throw new Error(`Invalid TOTP code: ${code}`)

    const otpGroup = authenticatedPage.locator('[data-slot="input-otp-group"]')
    await otpGroup.click()
    await authenticatedPage.keyboard.type(code)
    await authenticatedPage.getByRole('button', { name: /verify/i }).click()
    await expect(authenticatedPage.getByText(/authenticator enabled/i)).toBeVisible({
      timeout: 5000,
    })

    await expect(
      authenticatedPage.getByRole('button', { name: /remove authenticator/i }),
    ).toBeVisible({ timeout: 5000 })
    await authenticatedPage.getByRole('button', { name: /remove authenticator/i }).click()
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible()
    await authenticatedPage.getByRole('button', { name: /^remove$/i }).click()
    await expect(authenticatedPage.getByText(/scan qr code|or enter key manually/i)).toBeVisible({
      timeout: 10000,
    })
  })
})
