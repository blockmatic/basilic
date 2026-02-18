import { test as baseTest, expect } from '@playwright/test'
import { authHelpers } from './auth-helpers'
import { test as walletTest } from './fixtures-wallet-mock'

walletTest.describe('Link Email UI', () => {
  walletTest(
    'dashboard shows link email section when authenticated (wallet login)',
    async ({ page }) => {
      await authHelpers.loginWithEVMWallet(page)
      await page.goto('/')
      await expect(page.getByRole('heading', { name: /link email/i })).toBeVisible()
    },
  )
})

baseTest.describe('Link Email UI (magic link)', () => {
  baseTest(
    'link email shows "already linked" when user has email (magic link)',
    async ({ page }) => {
      const response = await authHelpers.sendMagicLink(page)
      expect(response.ok()).toBe(true)

      const token = await authHelpers.extractToken(page)
      if (!token) throw new Error('Failed to extract magic link token')
      await authHelpers.verifyMagicLink(page, token)

      await page.goto('/')
      await expect(page.getByText(/already linked/i)).toBeVisible({ timeout: 5000 })
    },
  )
})
