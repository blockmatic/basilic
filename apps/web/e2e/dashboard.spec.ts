import { expect, type Page, test } from '@playwright/test'

function visibleCoinRows(page: Page) {
  return page.locator('[data-testid="coin-row"]:visible')
}

function visibleCoinRow(page: Page, symbol: string) {
  return page.locator(`[data-testid="coin-row"][data-symbol="${symbol}"]:visible`)
}

test.describe('Dashboard routes', () => {
  test('home shows coin board from fixture', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Coins', exact: true })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByTestId('coin-board')).toBeVisible({ timeout: 15_000 })
    await expect(visibleCoinRow(page, 'btc')).toBeVisible()
    await expect(visibleCoinRow(page, 'eth')).toBeVisible()
    await expect(visibleCoinRow(page, 'doge')).toBeVisible()
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'btc')
    await expect(page.getByText('Showing a sample board.')).toBeVisible()
    await expect(visibleCoinRow(page, 'btc')).toContainText('$67,420.12')
    await expect(page.getByRole('heading', { name: 'Headlines' })).toHaveCount(0)
    await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=API OK')).toBeVisible({ timeout: 15_000 })
  })

  test('sortBy change24h lists doge first and Back restores rank', async ({ page }) => {
    await page.goto('/')
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'btc', {
      timeout: 15_000,
    })
    await page.goto('/?sortBy=change24h&sortDir=desc')
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'doge', {
      timeout: 15_000,
    })
    await page.goBack()
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'btc', {
      timeout: 15_000,
    })
  })

  test('watch star survives reload', async ({ page }) => {
    await page.goto('/')
    const star = visibleCoinRow(page, 'btc').getByTestId('coin-watch')
    await expect(star).toBeVisible({ timeout: 15_000 })
    if ((await star.getAttribute('aria-pressed')) !== 'true') await star.click()
    await expect(star).toHaveAttribute('aria-pressed', 'true')
    await page.reload()
    await expect(visibleCoinRow(page, 'btc').getByTestId('coin-watch')).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 15_000 },
    )
  })

  test('chip What moved? lists doge first and Back restores', async ({ page }) => {
    await page.goto('/')
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'btc', {
      timeout: 15_000,
    })
    await expect(page.getByTestId('board-rail')).toBeVisible()
    await page.getByRole('button', { name: 'What moved?' }).click()
    await expect(page).toHaveURL(/sortBy=change24h/)
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'doge', {
      timeout: 15_000,
    })
    await page.goBack()
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'btc', {
      timeout: 15_000,
    })
  })

  test('sidebar=close hides the rail and survives reload', async ({ page }) => {
    await page.goto('/?sidebar=close')
    await expect(page.getByTestId('coin-board')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('board-rail')).toHaveCount(0)
    await page.reload()
    await expect(page.getByTestId('board-rail')).toHaveCount(0)
  })

  test('markets path redirects to home', async ({ page }) => {
    await page.goto('/markets')
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 })
    await expect(page.getByTestId('coin-board')).toBeVisible({ timeout: 15_000 })
  })

  test('settings profile page shows title', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 15_000 })
  })

  test('settings security redirects to sessions', async ({ page }) => {
    await page.goto('/settings/security')
    await expect(page).toHaveURL(/\/settings\/security\/sessions/, { timeout: 5000 })
  })

  test('authed unknown path shows 404', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-e2e')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
  })
})

test.describe('Coin board SSR', () => {
  test.use({ javaScriptEnabled: false })

  test('sortBy change24h lists doge first without JS', async ({ page }) => {
    await page.goto('/?sortBy=change24h&sortDir=desc')
    await expect(page.getByTestId('coin-board')).toBeAttached({ timeout: 15_000 })
    await expect(page.getByTestId('coin-row').first()).toHaveAttribute('data-symbol', 'doge')
  })
})
