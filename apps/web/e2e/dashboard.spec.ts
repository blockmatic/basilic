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
    await expect(page.getByTestId('coin-board')).toHaveAttribute('data-spec-root', 'board')
    await expect(visibleCoinRow(page, 'btc')).toBeVisible()
    await expect(visibleCoinRow(page, 'eth')).toBeVisible()
    await expect(visibleCoinRow(page, 'sol')).toBeVisible()
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

  test('surface=account shows user info and watchlist table', async ({ page }) => {
    await page.goto('/')
    const star = visibleCoinRow(page, 'btc').getByTestId('coin-watch')
    await expect(star).toBeVisible({ timeout: 15_000 })
    if ((await star.getAttribute('aria-pressed')) !== 'true') await star.click()
    await expect(star).toHaveAttribute('aria-pressed', 'true')
    await page.goto('/?surface=account')
    await expect(page.getByTestId('user-info-card')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('user-info-card')).toContainText('test@test.ai')
    await expect(visibleCoinRow(page, 'btc')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  test('surface=dashboard paints overview widgets', async ({ page }) => {
    await page.goto('/?surface=dashboard')
    await expect(page.getByTestId('coin-board')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('metric-tile')).toHaveCount(3)
    await expect(page.getByTestId('trending-table')).toBeVisible()
    await expect(visibleCoinRow(page, 'btc')).toBeVisible()
  })

  test('Who am I? writes account surface and restores from history', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('whoami-command').click()
    await expect(page).toHaveURL(/surface=account/)
    await expect(page.getByTestId('user-info-card')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('command-history-row').first()).toHaveText('Who am I?')
    await page.goto('/')
    await expect(page.getByTestId('user-info-card')).toHaveCount(0)
    await page.getByTestId('command-history-row').first().click()
    await expect(page).toHaveURL(/surface=account/)
    await expect(page.getByTestId('user-info-card')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  test("What's on my list? stays table-only", async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: "What's on my list?" }).click()
    await expect(page).toHaveURL(/universe=watchlist/)
    await expect(page).not.toHaveURL(/surface=account/)
    await expect(page.getByTestId('user-info-card')).toHaveCount(0)
  })

  test('q plus filters compose without chat and keep chrome on refresh', async ({ page }) => {
    const chatHits: string[] = []
    page.on('request', request => {
      if (request.url().includes('/ai/chat')) chatHits.push(request.url())
    })
    await page.goto('/?q=What+moved%3F&sortBy=change24h&sortDir=desc&sidebar=close')
    await expect(page.getByTestId('coin-board')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('coin-board')).toHaveAttribute('data-spec-root', 'board')
    await expect(visibleCoinRows(page).first()).toHaveAttribute('data-symbol', 'doge')
    await expect(page.getByTestId('board-rail')).toHaveCount(0)
    expect(chatHits).toEqual([])
    await page.reload()
    await expect(page.getByTestId('board-rail')).toHaveCount(0)
    await expect(page).toHaveURL(/sortBy=change24h/)
    await expect(page).toHaveURL(/sidebar=close/)
  })

  test('rail=chat survives reload', async ({ page }) => {
    await page.goto('/?rail=chat')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('chat-empty')).toBeVisible()
    await page.reload()
    await expect(page.getByTestId('chat-empty')).toBeVisible()
    await expect(page).toHaveURL(/rail=chat/)
  })

  test('chip click drops q and whoami keeps it', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('whoami-command').click()
    await expect(page).toHaveURL(/surface=account/)
    await expect(page).toHaveURL(/q=/)
    await expect(page.getByTestId('user-info-card')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('user-info-card')).toContainText('test@test.ai')
    await page.getByRole('button', { name: 'What moved?' }).click()
    await expect(page).toHaveURL(/sortBy=change24h/)
    await expect(page).not.toHaveURL(/[?&]q=/)
    await expect(page.getByTestId('user-info-card')).toBeVisible()
  })

  test('GET elements restores the board and chips drop them', async ({ page }) => {
    const chatHits: string[] = []
    page.on('request', request => {
      if (request.url().includes('/ai/chat')) chatHits.push(request.url())
    })
    await page.goto('/?elements=summary,table-ranked')
    await expect(page.getByTestId('coin-board')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('coin-board')).toHaveAttribute('data-spec-root', 'board')
    await expect(visibleCoinRow(page, 'btc')).toBeVisible()
    expect(chatHits).toEqual([])
    await page.getByRole('button', { name: 'What moved?' }).click()
    await expect(page).toHaveURL(/sortBy=change24h/)
    await expect(page).not.toHaveURL(/elements=/)
  })

  test('Share copies the current href', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/?sortBy=change24h&sidebar=close')
    await expect(page.getByTestId('share-board')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('share-board').click()
    await expect(page.getByText('Copied to clipboard')).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('sortBy=change24h')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('sidebar=close')
  })

  test('missing SpeechRecognition hides the mic and typing still works', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined })
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        configurable: true,
        value: undefined,
      })
    })
    await page.goto('/')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Dictate to the board' })).toHaveCount(0)
    await page.getByRole('textbox', { name: 'Command' }).fill('top 10 coins today')
    await expect(page.getByRole('textbox', { name: 'Command' })).toHaveValue('top 10 coins today')
    await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled({ timeout: 15_000 })
  })

  test('typed command talks to eve', async ({ page }) => {
    test.skip(!process.env.EVE_E2E, 'eve is not spawned in default e2e')
    const chatHits: string[] = []
    page.on('request', request => {
      if (request.url().includes('/ai/chat')) chatHits.push(request.url())
    })
    await page.goto('/')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('textbox', { name: 'Command' }).fill('top 10 coins today')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page).toHaveURL(/q=/, { timeout: 30_000 })
    await expect(page.getByTestId('coin-board')).toBeVisible()
    expect(chatHits).toEqual([])
  })

  test('typed chat talks to eve without changing the canvas', async ({ page }) => {
    test.skip(!process.env.EVE_E2E, 'eve is not spawned in default e2e')
    const chatHits: string[] = []
    page.on('request', request => {
      if (request.url().includes('/ai/chat')) chatHits.push(request.url())
    })
    await page.goto('/?rail=chat&elements=summary,table-ranked')
    await expect(page.getByTestId('board-rail')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('textbox', { name: 'Chat' }).fill("what's on my list?")
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByTestId('chat-transcript')).toBeVisible({ timeout: 30_000 })
    await expect(page).toHaveURL(/rail=chat/)
    await expect(page).toHaveURL(/elements=summary,table-ranked/)
    await expect(page.getByTestId('coin-board')).toBeVisible()
    expect(chatHits).toEqual([])
  })
})

test.describe('Coin board SSR', () => {
  test.use({ javaScriptEnabled: false })

  test('sortBy change24h lists doge first without JS', async ({ page }) => {
    await page.goto('/?sortBy=change24h&sortDir=desc')
    await expect(page.getByTestId('coin-board')).toBeAttached({ timeout: 15_000 })
    await expect(page.getByTestId('coin-board')).toHaveAttribute('data-spec-root', 'board')
    await expect(page.getByTestId('coin-row').first()).toHaveAttribute('data-symbol', 'doge')
    const html = await page.content()
    expect(html.includes('"root"') || html.includes('/coins')).toBe(true)
  })

  test('sidebar=close hides the rail without JS', async ({ page }) => {
    await page.goto('/?sidebar=close')
    await expect(page.getByTestId('coin-board')).toBeAttached({ timeout: 15_000 })
    await expect(page.getByTestId('board-rail')).toHaveCount(0)
  })
})
