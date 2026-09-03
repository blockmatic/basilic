import { expect, test } from '@playwright/test'

const isCi = !!process.env.CI

test.describe('Chat Assistant', () => {
  test.setTimeout(90_000)

  test('should send message via Who am I? and show assistant response', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Signed In')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=API OK')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Open assistant' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible({ timeout: 5000 })
    await expect(sheet.getByPlaceholder('Type a message...')).toBeVisible({ timeout: 5000 })
    await sheet.getByRole('button', { name: 'Who am I?' }).click()

    const userTurn = sheet.locator('[data-role="user"]').filter({ hasText: 'Who am I?' })
    await expect(userTurn).toBeVisible({ timeout: 10_000 })

    const chatError = sheet.getByTestId('chat-error')
    const assistantLoc = sheet.locator('[data-role="assistant"]').last()
    const winner = await Promise.race([
      assistantLoc.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'assistant' as const),
      chatError.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'error' as const),
    ])
    let errorText = ''
    if (winner === 'error') {
      errorText = (await chatError.textContent()) ?? ''
      if (
        /insufficient_quota|insufficient_credits|quota_exceeded|credits_exceeded/i.test(errorText)
      ) {
        test.skip(true, 'AI provider quota/credits (402)')
        return
      }
      if (isCi) throw new Error(`Chat failed in CI: ${errorText || '(no error text)'}`)
    }
    await expect(chatError, `Chat failed: ${errorText || '(no error text)'}`).not.toBeVisible()
    await expect(assistantLoc).toBeVisible({ timeout: 60_000 })
  })
})
