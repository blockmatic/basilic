import { expect, test } from './fixtures-wallet-mock'

test('MetaMask wallet login flow', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /wallet login/i }).click()
  await expect(page.getByRole('heading', { name: /connect wallet/i })).toBeVisible({
    timeout: 5000,
  })
  const connectBtn = page.getByRole('button', { name: /connect evm wallet/i })
  await expect(connectBtn).toBeVisible({ timeout: 15_000 })
  await expect(connectBtn).toBeEnabled({ timeout: 15_000 })
  await connectBtn.evaluate((el: HTMLElement) => el.click())
  const signInBtn = page.getByRole('button', { name: /sign in with ethereum/i })
  await expect(signInBtn).toBeVisible({ timeout: 15_000 })
  await signInBtn.evaluate((el: HTMLElement) => el.click())
  await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 20_000 })
})
