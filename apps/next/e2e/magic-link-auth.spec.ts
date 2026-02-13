import { expect, type Page, test } from '@playwright/test'

const TEST_EMAIL = 'test@example.com'
// Use hardcoded URL for e2e tests - this matches the Fastify webServer URL in playwright.config.ts
const API_URL = 'http://localhost:3001'

/**
 * Helper function to send magic link request
 */
async function sendMagicLink(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_EMAIL)

  // Wait for network request to complete after form submission
  const [response] = await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes('/auth/magiclink/request') && resp.request().method() === 'POST',
    ),
    page.click('button[type="submit"]'),
  ])

  // Verify the request was successful
  expect(response.status()).toBe(200)

  // Wait for the success message indicating email was sent
  const successMessage = page.getByText(/check your email for the magic link/i)
  await expect(successMessage).toBeVisible({ timeout: 10000 })

  await new Promise(r => setTimeout(r, 200))
}

/**
 * Helper function to extract magic link token from Fastify test endpoint
 * Retries up to 5 times with 500ms delay between attempts
 */
async function extractToken(page: Page): Promise<string | null> {
  const maxRetries = 5
  const delayMs = 500

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await page.request.get(`${API_URL}/test/magic-link/last`)
      if (!response.ok()) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }
        return null
      }
      const data = await response.json()
      if (data.token) {
        return data.token
      }
      // Token is null, wait and retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }
      return null
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }
      return null
    }
  }
  return null
}

/**
 * Helper function to verify magic link and navigate to verify URL
 */
async function verifyMagicLink(page: Page, token: string) {
  const verifyUrl = `/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&callbackURL=/`
  await page.goto(verifyUrl)
  // Wait for redirect to root
  await page.waitForURL(/\//, { timeout: 5000 })
}

/**
 * Helper function to check if user is authenticated
 */
async function checkAuthenticated(page: Page) {
  // Check URL is root (dashboard)
  expect(page.url()).toMatch(/^https?:\/\/[^/]+\/?(\?.*)?$/)

  // Check dashboard content is visible
  const dashboardHeading = page.locator('text=Dashboard')
  await expect(dashboardHeading).toBeVisible()

  // Check user email is displayed in welcome message
  const welcomeText = page.locator(`text=Welcome back, ${TEST_EMAIL}`)
  await expect(welcomeText).toBeVisible({ timeout: 5000 })

  // Check API health badge shows "API OK" (indicates connected)
  const apiBadge = page.locator('text=API OK')
  await expect(apiBadge).toBeVisible({ timeout: 10000 })
}

test.describe('Magic Link Authentication', () => {
  test.describe.configure({ mode: 'serial' })

  test.describe('Valid Magic Link Flow', () => {
    test.describe.configure({ mode: 'serial' })

    test('should complete full magic link authentication flow', async ({ page }) => {
      // Step 1: Send magic link
      await sendMagicLink(page)

      // Step 2: Extract token from backend
      const token = await extractToken(page)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')

      if (!token) {
        throw new Error('Failed to extract magic link token')
      }

      // Step 3: Verify magic link
      await verifyMagicLink(page, token)

      // Step 4: Check authenticated state (should be on dashboard)
      await checkAuthenticated(page)
    })
  })

  test.describe('Invalid Magic Link Flow', () => {
    test('should redirect to login with error message for invalid token displayed below input', async ({
      page,
    }) => {
      // Navigate to verify URL with invalid token
      await page.goto('/api/auth/magic-link/verify?token=invalid-token-12345')

      // Should redirect to login page with message query param
      await page.waitForURL(/\/login\?.*message=/, { timeout: 5000 })

      // Check error message is displayed below input field (using FieldError component)
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()

      // Find the error element that is a sibling of the input (within the same Field)
      const fieldError = page.locator('[data-slot="field-error"]')
      await expect(fieldError.first()).toBeVisible()
      // The error message can be either "Invalid or expired magic link" or "Failed to verify magic link"
      await expect(fieldError.first()).toContainText(
        /(Invalid or expired magic link|Failed to verify magic link)/i,
      )

      // Verify error is within the same field container as the input
      const fieldContainer = page.locator('[data-slot="field"]:has(input[type="email"])')
      const errorInField = fieldContainer.locator('[data-slot="field-error"]')
      await expect(errorInField).toBeVisible()

      // Verify no JWT cookie is set
      const cookies = await page.context().cookies()
      const jwtCookie = cookies.find(cookie => cookie.name === 'better-auth.jwt_token')
      expect(jwtCookie).toBeUndefined()
    })

    test('should redirect to login with error message for missing token displayed below input', async ({
      page,
    }) => {
      await page.goto('/api/auth/magic-link/verify')

      // Should redirect to login page with message query param
      await page.waitForURL(/\/login\?.*message=/, { timeout: 5000 })

      // Check error message is displayed below input field
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()

      const fieldError = page.locator('[data-slot="field-error"]')
      await expect(fieldError.first()).toBeVisible()
      // The error message can be either "Invalid or expired magic link" or "Failed to verify magic link"
      await expect(fieldError.first()).toContainText(
        /(Invalid or expired magic link|Failed to verify magic link)/i,
      )
    })

    test('should redirect to login with error message for expired token displayed below input', async ({
      page,
    }) => {
      // Use a token that looks valid but is expired
      await page.goto('/api/auth/magic-link/verify?token=expired-token-abc123')

      // Should redirect to login page with message query param
      await page.waitForURL(/\/login\?.*message=/, { timeout: 5000 })

      // Check error message is displayed below input field
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()

      const fieldError = page.locator('[data-slot="field-error"]')
      await expect(fieldError.first()).toBeVisible()
      // The error message can be either "Invalid or expired magic link" or "Failed to verify magic link"
      await expect(fieldError.first()).toContainText(
        /(Invalid or expired magic link|Failed to verify magic link)/i,
      )
    })
  })

  test.describe('Email Validation', () => {
    test('should display email validation error below input field', async ({ page }) => {
      await page.goto('/login')

      // Fill in invalid email format
      const emailInput = page.locator('input[type="email"]')
      await emailInput.fill('invalid-email')

      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Check error message is displayed below input field using FieldError
      const fieldError = page.locator('[data-slot="field-error"]')
      await expect(fieldError.first()).toBeVisible({ timeout: 5000 })

      // Verify error is within the same field container as the input
      const fieldContainer = page.locator('[data-slot="field"]:has(input[type="email"])')
      const errorInField = fieldContainer.locator('[data-slot="field-error"]')
      await expect(errorInField).toBeVisible()

      // Verify error message contains validation-related text
      const errorText = await fieldError.first().textContent()
      expect(errorText).toBeTruthy()
      expect(errorText?.toLowerCase()).toMatch(/invalid|validation|email/)
    })
  })

  test.describe('Protected Route Access', () => {
    test.describe.configure({ mode: 'serial' })

    test('should redirect to login when accessing root without auth', async ({ page }) => {
      // Clear all cookies first
      await page.context().clearCookies()

      // Navigate directly to root (should redirect to login when not authenticated)
      await page.goto('/')

      // Should redirect to login page
      await page.waitForURL(/\/login/, { timeout: 5000 })

      // Verify login form is visible
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()
    })

    test('should access root after authentication', async ({ page }) => {
      // Authenticate first
      await sendMagicLink(page)
      const token = await extractToken(page)
      expect(token).toBeTruthy()

      if (!token) {
        throw new Error('Failed to extract magic link token')
      }

      await verifyMagicLink(page, token)

      // Now navigate to root directly (should show dashboard when authenticated)
      await page.goto('/')

      // Should stay on root (not redirect)
      await page.waitForURL(/^https?:\/\/[^/]+\/?(\?.*)?$/, { timeout: 5000 })

      // Verify authenticated content is visible
      await checkAuthenticated(page)
    })
  })

  test.describe('JWT Session Refresh', () => {
    test.describe.configure({ mode: 'serial' })

    test('should maintain session after authentication', async ({ page }) => {
      // Authenticate
      await sendMagicLink(page)
      const token = await extractToken(page)
      expect(token).toBeTruthy()

      if (!token) {
        throw new Error('Failed to extract magic link token')
      }

      await verifyMagicLink(page, token)

      // Get JWT cookie
      const cookies = await page.context().cookies()
      const jwtCookie = cookies.find(cookie => cookie.name === 'better-auth.jwt_token')
      expect(jwtCookie).toBeDefined()

      // Make authenticated request to user endpoint
      const response = await page.request.get('/api/auth/session/user')
      expect(response.ok()).toBeTruthy()

      const sessionData = await response.json()
      expect(sessionData).toHaveProperty('user')
      expect(sessionData.user).not.toBeNull()
      expect(sessionData.user.email).toBe(TEST_EMAIL)
    })
  })
})
