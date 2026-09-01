import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { test as setup } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const authFile = join(process.cwd(), 'test-results', '.auth', 'user.json')

setup('authenticate as test@test.ai', async ({ page }) => {
  await authHelpers.loginAsTestUser(page, authHelpers.testEmail)
  await mkdir(dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
