import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { test as base, expect } from '@playwright/test'
import { authHelpers } from './auth-helpers'

const baseURL =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
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
  authenticatedPage: async ({ authenticatedStorageState, browser }, use) => {
    const context = await browser.newContext({ baseURL, storageState: authenticatedStorageState })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect }
