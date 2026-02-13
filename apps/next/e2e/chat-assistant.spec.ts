import { expect, test } from '@playwright/test'
import { authHelpers } from './auth-helpers'

test.describe('Chat Assistant', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await authHelpers.loginAsTestUser(page)
    // After login we land on /
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 })
    await expect(page.locator(`text=Welcome back, ${authHelpers.TEST_EMAIL}`)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should show chat FAB on dashboard', async ({ page }) => {
    const fab = page.getByRole('button', { name: 'Open assistant' })
    await expect(fab).toBeVisible()
  })

  test('should open sheet and show empty state when FAB clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Open assistant' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible({ timeout: 5000 })
    await expect(sheet.getByRole('heading', { name: 'Assistant' })).toBeVisible()
    await expect(sheet.getByText('Start a conversation')).toBeVisible()
    await expect(sheet.getByText('Type a message below or try a suggestion')).toBeVisible()

    const suggestions = ['Who am I?', 'What can you help with?', 'Tell me a joke']
    for (const s of suggestions) {
      await expect(sheet.getByRole('button', { name: s })).toBeVisible()
    }

    const textarea = sheet.getByPlaceholder('Type a message...')
    await expect(textarea).toBeVisible()
  })

  test('should send message via suggestion and show assistant response', async ({ page }) => {
    await page.getByRole('button', { name: 'Open assistant' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible({ timeout: 5000 })
    await sheet.getByRole('button', { name: 'Who am I?' }).click()

    // User message should appear immediately in conversation
    await expect(sheet.locator('[data-role="user"]').filter({ hasText: 'Who am I?' })).toBeVisible({
      timeout: 10000,
    })
    // Assistant must respond (auth is validated in beforeEach)
    const assistantEl = sheet.locator('[data-role="assistant"]')
    await expect(assistantEl).toBeVisible({ timeout: 30000 })
    await expect(assistantEl).not.toBeEmpty()
  })

  test('should send message via input and show conversation', async ({ page }) => {
    await page.getByRole('button', { name: 'Open assistant' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible({ timeout: 5000 })

    const textarea = sheet.getByPlaceholder('Type a message...')
    await textarea.fill('Hi')
    await sheet.getByRole('button', { name: 'Send' }).click()

    // User message appears in conversation
    await expect(sheet.locator('[data-role="user"]').filter({ hasText: 'Hi' })).toBeVisible({
      timeout: 10000,
    })
    // Assistant must respond (auth is validated in beforeEach)
    const assistantEl = sheet.locator('[data-role="assistant"]')
    await expect(assistantEl).toBeVisible({ timeout: 30000 })
    await expect(assistantEl).not.toBeEmpty()
  })
})
