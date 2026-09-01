import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Logout', () => {
  test('header sign out revokes session and returns to login', async ({ page }) => {
    await authHelpers.loginAsTestUser(page)
    await expect(page.getByRole('link', { name: 'Sign out' })).toBeVisible({ timeout: 10_000 })

    const token = await authHelpers.extractSessionToken(page)
    expect(token).toBeTruthy()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
      .toMatch(/\/auth\/login/)

    const authedResponse = await page.request.get(`${authHelpers.apiUrl}/test/authed`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(authedResponse.status()).toBe(401)
  })
})
