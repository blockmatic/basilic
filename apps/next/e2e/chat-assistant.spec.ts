import { expect, test } from './fixtures'

test.describe('Chat Assistant', () => {
  test.use({ viewport: { width: 375, height: 667 } })
  test.setTimeout(60_000)

  test('should send message via Who am I? and show assistant response', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/')
    await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=API OK')).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: 'Open assistant' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible({ timeout: 5000 })
    await expect(sheet.getByPlaceholder('Type a message...')).toBeVisible({ timeout: 5000 })
    await sheet.getByRole('button', { name: 'Who am I?' }).click()

    await expect(sheet.locator('[data-role="user"]').filter({ hasText: 'Who am I?' })).toBeVisible({
      timeout: 10000,
    })

    const chatError = sheet.getByTestId('chat-error')
    const assistantLoc = sheet.locator('[data-role="assistant"]')
    const winner = await Promise.race([
      assistantLoc.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'assistant' as const),
      chatError.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'error' as const),
    ])
    if (winner === 'error') {
      const errorText = (await chatError.textContent()) ?? ''
      if (/402|insufficient|credits/i.test(errorText)) {
        test.skip(true, 'OpenRouter 402 insufficient credits')
        return
      }
      if (/fetch failed|ENOTFOUND|unreachable|connection|ECONNREFUSED|ETIMEDOUT/i.test(errorText)) {
        test.skip(true, 'AI provider unreachable')
        return
      }
    }
    await expect(chatError).not.toBeVisible()
    await expect(assistantLoc).toBeVisible({ timeout: 60_000 })
    await expect(sheet.getByTestId('user-info-card')).toBeVisible({ timeout: 60_000 })
  })
})
