import { expect, test } from '@playwright/test'

const oauthProviders = ['github', 'google', 'facebook', 'twitter'] as const
const missingParamsMessage = 'Invalid sign-in link - missing parameters'
const invalidCodeMessage = 'Invalid or expired sign-in code. Please try again.'

test.describe('Auth callback errors', () => {
  for (const provider of oauthProviders)
    test(`oauth ${provider} missing params shows catalog message`, async ({ page }) => {
      await page.goto(`/auth/callback/oauth/${provider}`)
      await page.waitForURL(/\/auth\/login\?.*message=/, { timeout: 5000 })
      await expect(
        page.locator('[data-slot="alert"]').filter({ hasText: missingParamsMessage }),
      ).toBeVisible()
    })

  test('passkey callback missing code shows catalog message', async ({ page }) => {
    await page.goto('/auth/callback/passkey')
    await page.waitForURL(/\/auth\/login\?.*message=/, { timeout: 5000 })
    await expect(
      page.locator('[data-slot="alert"]').filter({ hasText: invalidCodeMessage }),
    ).toBeVisible()
  })

  test('web3 callback missing code shows catalog message', async ({ page }) => {
    await page.goto('/auth/callback/web3')
    await page.waitForURL(/\/auth\/login\?.*message=/, { timeout: 5000 })
    await expect(
      page.locator('[data-slot="alert"]').filter({ hasText: invalidCodeMessage }),
    ).toBeVisible()
  })
})
