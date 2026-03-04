import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const { TEST_EMAIL } = authHelpers

function checkAuthenticated(page: import('@playwright/test').Page) {
  return {
    async run() {
      expect(page.url()).toMatch(/^https?:\/\/[^/]+\/?(\?.*)?$/)
      const dashboardHeading = page.locator('text=Dashboard')
      await expect(dashboardHeading).toBeVisible()
      const welcomeText = page.locator(`text=Welcome back, ${TEST_EMAIL}`)
      await expect(welcomeText).toBeVisible({ timeout: 5000 })
      const apiBadge = page.locator('text=API OK')
      await expect(apiBadge).toBeVisible({ timeout: 10000 })
    },
  }
}

test.describe('Magic Link Authentication', () => {
  test.describe.configure({ mode: 'serial' })

  test.describe('Valid Magic Link Flow', () => {
    test.describe.configure({ mode: 'serial' })

    test('should complete full magic link authentication flow', async ({ page }) => {
      const response = await authHelpers.sendMagicLink(page)
      expect(response.status()).toBe(200)
      expect(response.ok()).toBe(true)

      const token = await authHelpers.extractToken(page)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')

      if (!token) throw new Error('Failed to extract magic link token')

      await authHelpers.verifyMagicLink(page, token)
      await checkAuthenticated(page).run()
    })
  })

  test.describe('Invalid Magic Link Flow', () => {
    test('should redirect to login with error message for invalid token displayed below input', async ({
      page,
    }) => {
      await page.goto('/api/auth/magic-link/verify?token=invalid-token-12345')
      await page.waitForURL(/\/auth\/login\?.*(message|error)=/, { timeout: 5000 })

      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()

      const errorAlert = page.locator('[data-slot="alert"]')
      await expect(errorAlert).toBeVisible()
      await expect(errorAlert).toContainText(
        /(Invalid or expired magic link|Failed to verify magic link)/i,
      )

      const cookies = await page.context().cookies()
      const jwtCookie = cookies.find(cookie => cookie.name === 'better-auth.jwt_token')
      expect(jwtCookie).toBeUndefined()
    })

    test('should redirect to login with error message for missing token displayed below input', async ({
      page,
    }) => {
      await page.goto('/api/auth/magic-link/verify')
      await page.waitForURL(/\/auth\/login\?.*(message|error)=/, { timeout: 5000 })

      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()

      const errorAlert = page.locator('[data-slot="alert"]')
      await expect(errorAlert).toBeVisible()
      await expect(errorAlert).toContainText(
        /(Invalid or expired magic link|Failed to verify magic link)/i,
      )
    })

    test('should redirect to login with error message for expired token displayed below input', async ({
      page,
    }) => {
      await page.goto('/api/auth/magic-link/verify?token=expired-token-abc123')
      await page.waitForURL(/\/auth\/login\?.*(message|error)=/, { timeout: 5000 })

      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()

      const errorAlert = page.locator('[data-slot="alert"]')
      await expect(errorAlert).toBeVisible()
      await expect(errorAlert).toContainText(
        /(Invalid or expired magic link|Failed to verify magic link)/i,
      )
    })
  })

  test.describe('Email Validation', () => {
    test('should display email validation error below input field', async ({ page }) => {
      await page.goto('/auth/login')

      const emailInput = page.locator('input[type="email"]')
      await emailInput.fill('invalid-email')

      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      const fieldError = page.locator('[data-slot="field-error"]')
      await expect(fieldError.first()).toBeVisible({ timeout: 5000 })

      const fieldContainer = page.locator('[data-slot="field"]:has(input[type="email"])')
      const errorInField = fieldContainer.locator('[data-slot="field-error"]')
      await expect(errorInField).toBeVisible()

      const errorText = await fieldError.first().textContent()
      expect(errorText).toBeTruthy()
      expect(errorText?.toLowerCase()).toMatch(/invalid|validation|email/)
    })
  })

  test.describe('Protected Route Access', () => {
    test.describe.configure({ mode: 'serial' })

    test('should redirect to login when accessing root without auth', async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/')
      await page.waitForURL(/\/auth\/login/, { timeout: 5000 })

      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()
    })

    test('should access root after authentication', async ({ page }) => {
      await authHelpers.sendMagicLink(page)
      const token = await authHelpers.extractToken(page)
      expect(token).toBeTruthy()

      if (!token) throw new Error('Failed to extract magic link token')

      await authHelpers.verifyMagicLink(page, token)
      await page.goto('/')
      await page.waitForURL(/^https?:\/\/[^/]+\/?(\?.*)?$/, { timeout: 5000 })
      await checkAuthenticated(page).run()
    })
  })

  test.describe('JWT Session Refresh', () => {
    test.describe.configure({ mode: 'serial' })

    test('should maintain session after authentication', async ({ page }) => {
      await authHelpers.sendMagicLink(page)
      const token = await authHelpers.extractToken(page)
      expect(token).toBeTruthy()

      if (!token) throw new Error('Failed to extract magic link token')

      await authHelpers.verifyMagicLink(page, token)

      const cookies = await page.context().cookies()
      const jwtCookie = cookies.find(cookie => cookie.name === 'better-auth.jwt_token')
      expect(jwtCookie).toBeDefined()

      const response = await page.request.get('/api/auth/session/user')
      expect(response.ok()).toBeTruthy()

      const sessionData = await response.json()
      expect(sessionData).toHaveProperty('user')
      expect(sessionData.user).not.toBeNull()
      expect(sessionData.user.email).toBe(TEST_EMAIL)
    })
  })
})
