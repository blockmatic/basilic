import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const requestEmail = 'e2e-email@test.ai'

test.describe('Change email', () => {
  test.describe.configure({ mode: 'serial', retries: 0 })

  test('in-page verify updates email with toast', async ({ page }) => {
    const targetEmail = `e2e-email-${Date.now()}@test.ai`

    await authHelpers.loginAsTestUser(page, requestEmail)
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Change email' }).click()
    await page.getByLabel('New email address').fill(targetEmail)
    await page.getByRole('button', { name: 'Send code' }).click()
    await expect(page.getByText('Check your inbox for the verification code.')).toBeVisible({
      timeout: 10_000,
    })

    const verification = await authHelpers.extractChangeEmailData(page, targetEmail)
    expect(verification?.token).toMatch(/^\d{6}$/)

    if (!verification?.token) throw new Error('Failed to extract change-email code')

    await page.getByLabel('Verification code (6 digits)').fill(verification.token)
    await page.getByRole('button', { name: 'Verify' }).click()
    await expect(page.getByText('Email updated')).toBeVisible({ timeout: 15_000 })
  })
})
