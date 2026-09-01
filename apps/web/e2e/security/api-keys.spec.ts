import { expect, test } from '@playwright/test'

test.describe('API Keys', () => {
  test.describe.configure({ mode: 'serial' })

  test('should reach API keys tab and see card title', async ({ page }) => {
    await page.goto('/settings/security/apikeys')
    await expect(page.getByRole('tab', { name: 'API keys' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'API keys' })).toBeVisible({ timeout: 5000 })
  })

  test('should show empty state and Create key button', async ({ page }) => {
    await page.goto('/settings/security/apikeys')
    await expect(page.getByText('No API keys yet.')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /create key/i })).toBeVisible()
  })

  test('should create API key and show in table', async ({ page }) => {
    await page.goto('/settings/security/apikeys')
    await page.getByRole('button', { name: /create key/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 })
    await page.getByLabel('Name').fill('E2E Test Key')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/copy this key now/i)).toBeVisible()
    await page.getByRole('button', { name: 'Copy key' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByText('E2E Test Key')).toBeVisible({ timeout: 3000 })
  })

  test('should revoke API key', async ({ page }) => {
    await page.goto('/settings/security/apikeys')
    await expect(page.getByRole('button', { name: /create key/i })).toBeVisible({
      timeout: 5000,
    })
    let revokeBtn = page.getByRole('button', { name: /revoke e2e test key/i })
    while (await revokeBtn.isVisible().catch(() => false)) {
      await revokeBtn.click()
      await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
      await page.getByRole('button', { name: 'Revoke' }).click()
      await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 3000 })
      revokeBtn = page.getByRole('button', { name: /revoke e2e test key/i })
    }
    revokeBtn = page.getByRole('button', { name: /revoke e2e revoke test key/i })
    while (await revokeBtn.isVisible().catch(() => false)) {
      await revokeBtn.click()
      await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
      await page.getByRole('button', { name: 'Revoke' }).click()
      await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 3000 })
      revokeBtn = page.getByRole('button', { name: /revoke e2e revoke test key/i })
    }
    await page.getByRole('button', { name: /create key/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 })
    await page.getByLabel('Name').fill('E2E Revoke Test Key')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByText('E2E Revoke Test Key')).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: /revoke e2e revoke test key/i }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/revoke api key/i)).toBeVisible()
    await page.getByRole('button', { name: 'Revoke' }).click()
    await expect(page.getByText('No API keys yet.')).toBeVisible({ timeout: 5000 })
  })
})
