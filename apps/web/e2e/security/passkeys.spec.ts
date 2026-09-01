import { expect, test } from '@playwright/test'

test.describe('Security - Passkeys', () => {
  test.describe.configure({ mode: 'serial' })

  test('should reach page and see Passkeys card when authenticated', async ({ page }) => {
    await page.goto('/settings/security/passkeys')
    await expect(page).toHaveURL(/\/settings\/security\/passkeys/)
    await expect(page.getByRole('heading', { name: 'Passkeys' })).toBeVisible()
    await expect(page.getByText(/no passkeys configured/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add passkey/i })).toBeVisible()
  })

  test('should add passkey with CDP virtual authenticator and remove it', async ({ page }) => {
    await page.goto('/settings/security/passkeys')
    await expect(page.getByRole('button', { name: /add passkey/i })).toBeVisible({
      timeout: 10_000,
    })

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

    await page.getByRole('button', { name: /add passkey/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(/passkey added/i)).toBeVisible({ timeout: 10_000 })

    await expect(page.getByRole('button', { name: /^remove /i })).toBeVisible({ timeout: 5000 })
    await page
      .getByRole('button', { name: /^remove /i })
      .first()
      .click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: /^remove$/i }).click()
    await expect(page.getByText(/no passkeys configured/i)).toBeVisible({ timeout: 10_000 })
  })
})
