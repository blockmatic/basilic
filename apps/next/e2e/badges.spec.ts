import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Badges', () => {
  test.describe('API Health Badge', () => {
    test('should show API OK on login page when API is reachable', async ({ page }) => {
      await page.goto('/login')
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 10000 })
    })

    test('should show API OK on dashboard when authenticated', async ({ page }) => {
      await authHelpers.loginAsTestUser(page)
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Auth Badge', () => {
    test('should show Signed Out on login page when unauthenticated', async ({ page }) => {
      await page.goto('/login')
      await expect(page.locator('text=Signed Out')).toBeVisible({ timeout: 10000 })
    })

    test('should show Signed In on dashboard when authenticated', async ({ page }) => {
      await authHelpers.loginAsTestUser(page)
      await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Badge layout', () => {
    test('should show both badges side by side on login page', async ({ page }) => {
      await page.goto('/login')
      const apiBadge = page.locator('text=API OK')
      const authBadge = page.locator('text=Signed Out')
      await expect(apiBadge).toBeVisible({ timeout: 10000 })
      await expect(authBadge).toBeVisible({ timeout: 10000 })
    })

    test('should show both badges side by side on dashboard when authenticated', async ({
      page,
    }) => {
      await authHelpers.loginAsTestUser(page)
      const apiBadge = page.locator('text=API OK')
      const authBadge = page.locator('text=Signed In')
      await expect(apiBadge).toBeVisible({ timeout: 10000 })
      await expect(authBadge).toBeVisible({ timeout: 10000 })
    })
  })
})
