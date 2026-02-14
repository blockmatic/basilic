import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const API_BASE = authHelpers.API_URL

function waitForHealthResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse(
    resp => resp.url().startsWith(`${API_BASE}/health`) && resp.request().method() === 'GET',
    { timeout: 10000 },
  )
}

function waitForUserResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse(
    resp =>
      resp.url().startsWith(`${API_BASE}/auth/session/user`) && resp.request().method() === 'GET',
    { timeout: 10000 },
  )
}

test.describe('Badges', () => {
  test.describe('API Health Badge', () => {
    test('should show API OK on login page when API is reachable', async ({ page }) => {
      const healthPromise = waitForHealthResponse(page)
      await page.goto('/login')
      await healthPromise
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 5000 })
    })

    test('should show API OK on dashboard when authenticated', async ({ page }) => {
      const healthPromise = waitForHealthResponse(page)
      await authHelpers.loginAsTestUser(page)
      await healthPromise
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Auth Badge', () => {
    test('should show Signed Out on login page when unauthenticated', async ({ page }) => {
      const userPromise = waitForUserResponse(page)
      await page.goto('/login')
      await userPromise
      await expect(page.locator('text=Signed Out')).toBeVisible({ timeout: 5000 })
    })

    test('should show Signed In on dashboard when authenticated', async ({ page }) => {
      await authHelpers.loginAsTestUser(page)
      await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Badge layout', () => {
    test('should show both badges side by side on login page', async ({ page }) => {
      const [healthPromise, userPromise] = [waitForHealthResponse(page), waitForUserResponse(page)]
      await page.goto('/login')
      await Promise.all([healthPromise, userPromise])
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Signed Out')).toBeVisible({ timeout: 5000 })
    })

    test('should show both badges side by side on dashboard when authenticated', async ({
      page,
    }) => {
      await authHelpers.loginAsTestUser(page)
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 15000 })
    })
  })
})
