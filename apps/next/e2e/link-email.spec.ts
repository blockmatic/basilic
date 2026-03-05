import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Link Email UI (magic link)', () => {
  test('link email shows "already linked" when user has email (magic link)', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/')
    // Profile tab shows user email when linked; "Email cannot be changed" appears for linked accounts
    await expect(page.getByText(/Email cannot be changed/i)).toBeVisible({ timeout: 5000 })
  })
})
