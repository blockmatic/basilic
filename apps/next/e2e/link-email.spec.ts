import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Link Email UI', () => {
  test('dashboard shows link email section when authenticated', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /link email/i })).toBeVisible()
  })

  test('link email shows "already linked" when user has email (magic link)', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/dashboard')
    await expect(page.getByText(/already linked/i)).toBeVisible({ timeout: 5000 })
  })
})
