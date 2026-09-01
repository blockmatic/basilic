import { expect, test } from '@playwright/test'
import { authHelpers } from '../auth-helpers'

test.describe('Security - Authenticator', () => {
  test.describe.configure({ mode: 'serial' })

  test('should reach page and see layout when authenticated', async ({ page }) => {
    await page.goto('/settings/security/totp')
    await expect(page).toHaveURL(/\/settings\/security\/totp/)
    await expect(page.getByRole('tab', { name: /passkeys/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /authenticator/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /api keys/i })).toBeVisible()
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: 'Authenticator app' }).first(),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('should show setup flow with QR and InputOTP when TOTP not configured', async ({ page }) => {
    await page.goto('/settings/security/totp')
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: 'Authenticator app' }).first(),
    ).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Set up authenticator' }).click()
    await expect(page.getByText(/scan qr code/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('[data-slot="input-otp-group"]')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /verify/i })).toBeVisible()
  })

  test('should complete full TOTP setup and unlink', async ({ page }) => {
    await page.goto('/settings/security/totp')
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: 'Authenticator app' }).first(),
    ).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Set up authenticator' }).click()
    await expect(page.getByText(/scan qr code/i)).toBeVisible({ timeout: 15_000 })

    const token = await authHelpers.extractSessionToken(page)
    if (!token) throw new Error('Failed to extract session token')
    const res = await page.request.get(`${authHelpers.apiUrl}/test/totp/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok()) {
      const body = await res.text()
      throw new Error(`TOTP current failed: ${res.status()} ${body}`)
    }
    const { code } = (await res.json()) as { code: string }
    if (code?.length !== 6) throw new Error(`Invalid TOTP code: ${code}`)

    const otpInput = page.locator('[data-slot="input-otp"]')
    await otpInput.fill(code)
    await page.getByRole('button', { name: /verify/i }).click()
    await expect(
      page.locator('[data-slot="card-content"]').getByText('Authenticator enabled'),
    ).toBeVisible({ timeout: 5000 })

    await expect(page.getByRole('button', { name: /remove authenticator/i })).toBeVisible({
      timeout: 5000,
    })
    await page.getByRole('button', { name: /remove authenticator/i }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: /^remove$/i }).click()
    await expect(page.getByRole('button', { name: 'Set up authenticator' })).toBeVisible({
      timeout: 10_000,
    })
  })
})
