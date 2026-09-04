import { expect, test } from '@playwright/test'

test.describe('Security - Sessions', () => {
  test.describe.configure({ mode: 'serial' })

  test('lists the current session without revoking it', async ({ page }) => {
    await page.goto('/settings/security/sessions')
    await expect(page.getByRole('tab', { name: 'Sessions' })).toBeVisible()
    await expect(page.getByText('Devices signed in to your account.')).toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByText('Current')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign out of current session/i })).toBeVisible()
  })
})
