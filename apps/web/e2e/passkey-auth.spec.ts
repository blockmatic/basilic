import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const passkeyEmail = 'e2e-passkey@test.ai'

test.describe('Passkey sign-in', () => {
  test.describe.configure({ mode: 'serial' })

  test('should sign in with passkey after adding one', async ({ page }) => {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('WebAuthn.enable')
    await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    })

    await authHelpers.loginAsTestUser(page, passkeyEmail)
    await page.goto('/settings/security/passkeys')
    await expect(page.getByRole('button', { name: /add passkey/i })).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole('button', { name: /add passkey/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(/passkey added/i)).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
      .toMatch(/\/auth\/login/)

    await expect(page.getByRole('button', { name: /Continue with Passkey/i })).toBeVisible({
      timeout: 10_000,
    })
    await page.getByRole('button', { name: /Continue with Passkey/i }).click()

    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/, { timeout: 15_000 })
    await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('link', { name: 'Profile' }).first()).toBeVisible({ timeout: 5000 })
  })
})
