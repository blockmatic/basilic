import { expect, test } from './fixtures'

test.describe
  .skip('Passkey sign-in', () => {
    test.describe.configure({ mode: 'serial' })

    test('should sign in with passkey after adding one', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/settings/security/passkeys')
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

      await authenticatedPage.goto('/auth/logout')
      await authenticatedPage.goto('/auth/login')

      await expect(
        authenticatedPage.getByRole('button', { name: /sign in with passkey/i }),
      ).toBeVisible({ timeout: 5000 })
      await authenticatedPage.getByRole('button', { name: /sign in with passkey/i }).click()

      await expect(authenticatedPage).toHaveURL(/^https?:\/\/[^/]+\/$/, { timeout: 15000 })
      await expect(authenticatedPage.getByRole('link', { name: /settings/i })).toBeVisible({
        timeout: 5000,
      })
    })
  })
