import { expect, test } from '../fixtures'

test.describe('Security - Passkeys', () => {
  test.describe.configure({ mode: 'serial' })

  test('should redirect to login when unauthenticated', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/settings/security?section=passkeys')
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('should reach page and see Passkeys card when authenticated', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/settings/security?section=passkeys')
    await expect(authenticatedPage).toHaveURL(/\/settings\/security/)
    await expect(authenticatedPage.getByRole('heading', { name: 'Passkeys' })).toBeVisible()
    await expect(authenticatedPage.getByText(/no passkeys configured/i)).toBeVisible()
    await expect(authenticatedPage.getByRole('button', { name: /add passkey/i })).toBeVisible()
  })

  test('should add passkey with CDP virtual authenticator and remove it', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/settings/security?section=passkeys')
    await expect(authenticatedPage.getByRole('button', { name: /add passkey/i })).toBeVisible({
      timeout: 10000,
    })

    const cdp = await authenticatedPage.context().newCDPSession(authenticatedPage)
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

    await authenticatedPage.getByRole('button', { name: /add passkey/i }).click()
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible()
    await authenticatedPage.getByRole('button', { name: /^add$/i }).click()
    await expect(authenticatedPage.getByText(/passkey added/i)).toBeVisible({ timeout: 10000 })

    await expect(authenticatedPage.getByRole('button', { name: /remove/i })).toBeVisible({
      timeout: 5000,
    })
    await authenticatedPage
      .getByRole('button', { name: /remove/i })
      .first()
      .click()
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible()
    await authenticatedPage.getByRole('button', { name: /^remove$/i }).click()
    await expect(authenticatedPage.getByText(/no passkeys configured/i)).toBeVisible({
      timeout: 10000,
    })
  })
})
