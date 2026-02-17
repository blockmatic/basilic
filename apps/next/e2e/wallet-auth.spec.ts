import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Wallet Authentication UI', () => {
  test.describe.configure({ mode: 'serial' })
  test('login page shows wallet login and magic link; wallet options after click', async ({
    page,
  }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /wallet login/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()

    await page.getByRole('button', { name: /wallet login/i }).click()
    await expect(page.getByRole('button', { name: /connect evm wallet/i })).toBeVisible()
  })

  test('root shows dashboard content after magic link auth', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    expect(token).toBeTruthy()
    if (!token) throw new Error('Failed to extract magic link token')

    await authHelpers.verifyMagicLink(page, token)
    await page.waitForURL(url => url.pathname === '/' || url.pathname === '', { timeout: 5000 })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByText(/link wallet/i)).toBeVisible()
    await expect(page.getByText(/link email/i)).toBeVisible()
  })

  test('sign-out from root redirects to login', async ({ page }) => {
    const response = await authHelpers.sendMagicLink(page)
    expect(response.ok()).toBe(true)

    const token = await authHelpers.extractToken(page)
    if (!token) throw new Error('Failed to extract magic link token')
    await authHelpers.verifyMagicLink(page, token)

    await page.goto('/')
    await page.getByRole('link', { name: /sign out/i }).click()
    await page.waitForURL(/\/login/, { timeout: 5000 })
  })
})
