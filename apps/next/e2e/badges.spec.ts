import { authHelpers } from './auth-helpers'
import { expect, test } from './fixtures'

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
  test.describe('Unauthenticated', () => {
    test('should show API OK on login page when API is reachable', async ({ page }) => {
      const healthPromise = waitForHealthResponse(page)
      await page.goto('/login')
      await healthPromise
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 5000 })
    })

    test('should show Signed Out on login page when unauthenticated', async ({ page }) => {
      const userPromise = waitForUserResponse(page)
      await page.goto('/login')
      await userPromise
      await expect(page.locator('text=Signed Out')).toBeVisible({ timeout: 5000 })
    })

    test('should show both badges side by side on login page', async ({ page }) => {
      const [healthPromise, userPromise] = [waitForHealthResponse(page), waitForUserResponse(page)]
      await page.goto('/login')
      await Promise.all([healthPromise, userPromise])
      await expect(page.locator('text=API OK')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Signed Out')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Authenticated', () => {
    test('should show Signed In on dashboard when authenticated', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/')
      await expect(authenticatedPage.locator('text=Signed In')).toBeVisible({ timeout: 15000 })
    })

    test('should show API OK on dashboard when authenticated', async ({ authenticatedPage }) => {
      const healthPromise = waitForHealthResponse(authenticatedPage)
      await authenticatedPage.goto('/')
      await healthPromise
      await expect(authenticatedPage.locator('text=API OK')).toBeVisible({ timeout: 5000 })
    })

    test('should show both badges side by side on dashboard when authenticated', async ({
      authenticatedPage,
    }) => {
      const [healthPromise, userPromise] = [
        waitForHealthResponse(authenticatedPage),
        waitForUserResponse(authenticatedPage),
      ]
      await authenticatedPage.goto('/')
      await Promise.all([healthPromise, userPromise])
      await expect(authenticatedPage.locator('text=API OK')).toBeVisible({ timeout: 15000 })
      await expect(authenticatedPage.locator('text=Signed In')).toBeVisible({ timeout: 15000 })
    })
  })
})
