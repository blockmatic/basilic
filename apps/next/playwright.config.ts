import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI
const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // PGLite does not support concurrent writers; run tests in series
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: 1,
  reporter: isCi ? 'github' : 'list',
  globalSetup: './e2e/playwright-global-setup.ts',
  globalTeardown: './e2e/playwright-global-teardown.ts',
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(bypassSecret && {
      extraHTTPHeaders: {
        'x-vercel-protection-bypass': bypassSecret,
        'x-vercel-set-bypass-cookie': 'true',
      },
    }),
  },
  projects: [
    {
      name: 'auth',
      testMatch: [
        '**/magic-link-auth.spec.ts',
        '**/wallet-auth.spec.ts',
        '**/link-email.spec.ts',
        '**/link-wallet.spec.ts',
      ],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testMatch: '**/*.spec.ts',
      testIgnore: [
        '**/magic-link-auth.spec.ts',
        '**/wallet-auth.spec.ts',
        '**/link-email.spec.ts',
        '**/link-wallet.spec.ts',
      ],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
