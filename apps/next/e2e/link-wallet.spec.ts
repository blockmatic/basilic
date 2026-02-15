import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Link Wallet UI', () => {
  test('dashboard shows connect wallet options when authenticated', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /link wallet/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /connect solana wallet/i })).toBeVisible()
  })

  test('Wallet & Email link navigates to dashboard from root', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/')
    await page.getByRole('link', { name: /wallet & email/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
