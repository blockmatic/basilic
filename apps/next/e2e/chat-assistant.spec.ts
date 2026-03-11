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

    const userTurn = sheet.locator('[data-role="user"]').filter({ hasText: 'Who am I?' })
    await expect(userTurn).toBeVisible({ timeout: 10000 })

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
        test.skip(true, 'OpenRouter 402 insufficient credits')
        return
      }
      if (/invalid x-api-key|authentication_error|invalid.*api.*key|401/i.test(errorText)) {
        test.skip(true, 'AI provider auth invalid (401/invalid API key)')
        return
      }
      if (
        /ECONNREFUSED|fetch failed|ENOTFOUND|ETIMEDOUT|ECONNRESET|Connection timed out|Error code 522|status_code: 522/i.test(
          errorText,
        )
      ) {
        test.skip(true, 'AI provider unreachable (network/timeout/522)')
        return
      }
      if (/AI provider request failed|upstream|Try again later/i.test(errorText)) {
        test.skip(true, `Ollama/AI upstream unreachable: ${errorText.slice(0, 80)}`)
        return
      }
    }
    await expect(chatError, `Chat failed: ${errorText || '(no error text)'}`).not.toBeVisible()
    await expect(assistantLoc).toBeVisible({ timeout: 60_000 })
    // Model may call getAccountInfo (user-info-card) or respond with text only
    const hasCard = await sheet
      .getByTestId('user-info-card')
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false)
    if (!hasCard) await expect(assistantLoc).toContainText(/\S/, { timeout: 5000 })
  })
})
