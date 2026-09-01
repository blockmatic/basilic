import { expect, test } from '@playwright/test'

test.describe('Dashboard routes', () => {
  test('home shows news heading or fallback copy', async ({ page }) => {
    await page.goto('/')
    const newsHeading = page.getByRole('heading', { name: 'Latest News' })
    const fallback = page.getByText(/Add NEWSAPI_KEY|No headlines available/i)
    await expect(newsHeading.or(fallback).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=API OK')).toBeVisible({ timeout: 15_000 })
  })

  test('markets page shows title', async ({ page }) => {
    await page.goto('/markets')
    await expect(page.getByRole('heading', { name: 'Markets' })).toBeVisible({ timeout: 15_000 })
  })

  test('settings profile page shows title', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 15_000 })
  })

  test('settings security redirects to passkeys', async ({ page }) => {
    await page.goto('/settings/security')
    await expect(page).toHaveURL(/\/settings\/security\/passkeys/, { timeout: 5000 })
  })

  test('authed unknown path shows 404', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-e2e')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
  })
})
