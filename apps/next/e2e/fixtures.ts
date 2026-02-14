import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { test as base, expect } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
// test-results is gitignored and in gitleaks exclude; contains JWT tokens
const authFile = join(process.cwd(), 'test-results', '.auth', 'user.json')

export const test = base.extend<
  { authenticatedPage: import('@playwright/test').Page },
  { authenticatedStorageState: string }
>({
  authenticatedStorageState: [
    async (
      { browser }: { browser: import('@playwright/test').Browser },
      runWith: (path: string) => Promise<void>,
    ) => {
      const context = await browser.newContext({ baseURL })
      const page = await context.newPage()
      await authHelpers.loginAsTestUser(page)
      await mkdir(dirname(authFile), { recursive: true })
      await context.storageState({ path: authFile })
      await context.close()
      await runWith(authFile)
    },
    { scope: 'worker' },
  ],
  authenticatedPage: async ({ authenticatedStorageState, browser }, runWith) => {
    const context = await browser.newContext({ baseURL, storageState: authenticatedStorageState })
    const page = await context.newPage()
    await runWith(page)
    await context.close()
  },
})

export { expect }
