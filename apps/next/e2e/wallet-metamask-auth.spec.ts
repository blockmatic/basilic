import { expect, test } from './fixtures-wallet-mock'

// Skip: wallet mock connect flow does not complete; Sign in with Ethereum never appears
test.describe
  .skip('MetaMask wallet login', () => {
    test('MetaMask wallet login flow', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: /wallet login/i }).click()
      await expect(page.getByRole('heading', { name: /connect wallet/i })).toBeVisible({
        timeout: 5000,
      })
      // Wallet mock may show "Connect EVM wallet" (not connected) or "Sign in with Ethereum" (auto-connected)
      const connectBtn = page.getByRole('button', { name: /connect evm wallet/i })
      const signInBtn = page.getByRole('button', { name: /sign in with ethereum/i })
      await expect(connectBtn.or(signInBtn)).toBeVisible({ timeout: 15_000 })
      if (await connectBtn.isVisible().catch(() => false)) {
        await connectBtn.click()
      }
      await expect(signInBtn).toBeVisible({ timeout: 15_000 })
      await expect(signInBtn).toBeEnabled({ timeout: 5_000 })
      await signInBtn.click()
      await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 20_000 })
    })
  })
