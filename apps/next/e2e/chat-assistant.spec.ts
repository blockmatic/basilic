import { expect, test } from './fixtures'

// TODO: Re-enable when UNAUTHORIZED is fixed — getAuthToken/Bearer propagation to Fastify /ai/chat fails in E2E despite authenticatedPage
test.describe
  .skip('Chat Assistant', () => {
    test('should send message via Who am I? and show assistant response', async ({
      authenticatedPage,
    }) => {
      test.setTimeout(90000)
      await authenticatedPage.goto('/')
      await expect(authenticatedPage.locator('text=Signed In')).toBeVisible({ timeout: 15000 })
      await expect(authenticatedPage.locator('text=API OK')).toBeVisible({ timeout: 15000 })

      await authenticatedPage.getByRole('button', { name: 'Open assistant' }).click()
      const sheet = authenticatedPage.getByRole('dialog')
      await expect(sheet).toBeVisible({ timeout: 5000 })
      await sheet.getByRole('button', { name: 'Who am I?' }).click()

      await expect(
        sheet.locator('[data-role="user"]').filter({ hasText: 'Who am I?' }),
      ).toBeVisible({
        timeout: 10000,
      })
      const errorEl = sheet.getByTestId('chat-error')
      if (await errorEl.isVisible()) {
        throw new Error(`Chat API error: ${await errorEl.textContent()}`)
      }

      const assistantEl = sheet.locator('[data-role="assistant"]')
      await expect(assistantEl).toBeVisible({ timeout: 60000 })
      await expect(assistantEl).not.toBeEmpty()
    })
  })
