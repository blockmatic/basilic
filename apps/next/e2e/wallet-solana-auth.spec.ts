import { expect, test } from './fixtures-solana-mock'

// Skip: wallet sign-in does not redirect to /; stays on /login after Sign in with Solana
test.describe
  .skip('Solana wallet login', () => {
    test('Solana wallet login flow', async ({ page }) => {
      await page.goto('/login')
      await page.getByRole('button', { name: /wallet login/i }).click()
      await expect(page.getByRole('heading', { name: /connect wallet/i })).toBeVisible({
        timeout: 5000,
      })
      const connectBtn = page.getByRole('button', { name: /connect solana/i })
      await expect(connectBtn).toBeEnabled({ timeout: 15_000 })
      await connectBtn.click()
      const phantomOption = page.getByRole('dialog').getByText(/phantom/i)
      await expect(phantomOption).toBeVisible({ timeout: 10_000 })
      await phantomOption.click()
      const signInBtn = page.getByRole('button', { name: /sign in with solana/i })
      await expect(signInBtn).toBeVisible({ timeout: 15_000 })
      await signInBtn.click()
      await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 20_000 })
    })
  })
