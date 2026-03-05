import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Magic link verified account', () => {
  test('profile shows verified email state after magic link auth', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/')
    // Profile tab shows user email when verified; "Email cannot be changed" appears for verified accounts
    await expect(page.getByText(/Email cannot be changed/i)).toBeVisible({ timeout: 5000 })
  })
})
