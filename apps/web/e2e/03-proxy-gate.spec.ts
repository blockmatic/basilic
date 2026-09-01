import { expect, test } from '@playwright/test'

const protectedPaths = ['/', '/markets', '/settings', '/settings/security/passkeys']

test.describe('Proxy auth gate', () => {
  for (const path of protectedPaths)
    test(`redirects unauthenticated ${path} to login`, async ({ page }) => {
      await page.context().clearCookies()
      await page.goto(path)
      await page.waitForURL(/\/auth\/login/, { timeout: 5000 })
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })
})
