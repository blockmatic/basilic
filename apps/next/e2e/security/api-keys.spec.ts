import { expect, test } from '../fixtures'

test.describe('API Keys', () => {
  test.describe.configure({ mode: 'serial' })

  test('should redirect to login when unauthenticated', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/settings/security/apikeys')
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('should reach API keys tab and see card title', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings/security/apikeys')
    await expect(authenticatedPage.getByRole('tab', { name: 'API keys' })).toBeVisible()
    await expect(authenticatedPage.getByRole('heading', { name: 'API keys' })).toBeVisible({
      timeout: 5000,
    })
  })

  test('should show empty state and Create key button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings/security/apikeys')
    await expect(authenticatedPage.getByText('No API keys yet.')).toBeVisible({ timeout: 5000 })
    await expect(authenticatedPage.getByRole('button', { name: /create key/i })).toBeVisible()
  })

  test('should create API key and show in table', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings/security/apikeys')
    await authenticatedPage.getByRole('button', { name: /create key/i }).click()
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 3000 })
    await authenticatedPage.getByLabel('Name').fill('E2E Test Key')
    await authenticatedPage.getByRole('button', { name: 'Create' }).click()
    await expect(authenticatedPage.getByRole('alertdialog')).toBeVisible({ timeout: 5000 })
    await expect(authenticatedPage.getByText(/copy this key now/i)).toBeVisible()
    await authenticatedPage.getByRole('button', { name: 'Copy key' }).click()
    await authenticatedPage.getByRole('button', { name: 'Done' }).click()
    await expect(authenticatedPage.getByText('E2E Test Key')).toBeVisible({ timeout: 3000 })
  })

  test('should revoke API key', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings/security/apikeys')
    await expect(authenticatedPage.getByRole('button', { name: /create key/i })).toBeVisible({
      timeout: 5000,
    })
    // Revoke any keys from previous tests so we end with empty state
    let revokeBtn = authenticatedPage.getByRole('button', { name: /revoke e2e test key/i })
    while (await revokeBtn.isVisible().catch(() => false)) {
      await revokeBtn.click()
      await expect(authenticatedPage.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
      await authenticatedPage.getByRole('button', { name: 'Revoke' }).click()
      await expect(authenticatedPage.getByRole('alertdialog')).not.toBeVisible({ timeout: 3000 })
      revokeBtn = authenticatedPage.getByRole('button', { name: /revoke e2e test key/i })
    }
    revokeBtn = authenticatedPage.getByRole('button', { name: /revoke e2e revoke test key/i })
    while (await revokeBtn.isVisible().catch(() => false)) {
      await revokeBtn.click()
      await expect(authenticatedPage.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
      await authenticatedPage.getByRole('button', { name: 'Revoke' }).click()
      await expect(authenticatedPage.getByRole('alertdialog')).not.toBeVisible({ timeout: 3000 })
      revokeBtn = authenticatedPage.getByRole('button', { name: /revoke e2e revoke test key/i })
    }
    // Create and revoke our test key
    await authenticatedPage.getByRole('button', { name: /create key/i }).click()
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 3000 })
    await authenticatedPage.getByLabel('Name').fill('E2E Revoke Test Key')
    await authenticatedPage.getByRole('button', { name: 'Create' }).click()
    await expect(authenticatedPage.getByRole('alertdialog')).toBeVisible({ timeout: 5000 })
    await authenticatedPage.getByRole('button', { name: 'Done' }).click()
    await expect(authenticatedPage.getByText('E2E Revoke Test Key')).toBeVisible({ timeout: 3000 })
    await authenticatedPage.getByRole('button', { name: /revoke e2e revoke test key/i }).click()
    await expect(authenticatedPage.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
    await expect(authenticatedPage.getByText(/revoke api key/i)).toBeVisible()
    await authenticatedPage.getByRole('button', { name: 'Revoke' }).click()
    await expect(authenticatedPage.getByText('No API keys yet.')).toBeVisible({ timeout: 5000 })
  })
})
