import { expect, test } from '@playwright/test'

test.describe('Public routes', () => {
  test('privacy page shows title and back link', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to login' })).toBeVisible()
  })

  test('terms page shows title and back link', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to login' })).toBeVisible()
  })

  test('login page shows welcome and email form', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByText('Welcome to Acme')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByTestId('send-magic-link')).toBeVisible()
  })

  test('login OAuth icon buttons are disabled when providers unconfigured', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeDisabled({
      timeout: 15_000,
    })
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeDisabled()
    await expect(page.getByRole('button', { name: /Continue with Facebook/i })).toBeDisabled()
    await expect(page.getByRole('button', { name: /Continue with X/i })).toBeDisabled()
  })

  test('robots.txt and sitemap.xml return 200', async ({ request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
  })
})
