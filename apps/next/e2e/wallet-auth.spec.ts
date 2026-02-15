import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Wallet Authentication UI', () => {
  test.describe.configure({ mode: 'serial' })
  test('login page shows wallet sign-in buttons', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /connect solana wallet/i })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('dashboard is accessible and shows wallet section after magic link auth', async ({
    page,
  }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    expect(token).toBeTruthy()
    if (!token) throw new Error('Failed to extract magic link token')

    await authHelpers.verifyMagicLink(page, token)
    await page.waitForURL(url => url.pathname === '/' || url.pathname === '', { timeout: 5000 })

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByText(/link wallet/i)).toBeVisible()
    await expect(page.getByText(/link email/i)).toBeVisible()
  })

  test('sign-out from dashboard redirects to login', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/dashboard')
    await page.getByRole('link', { name: /sign out/i }).click()
    await page.waitForURL(/\/login/, { timeout: 5000 })
  })
})
