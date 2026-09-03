import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI
const apiUrl =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

export default defineConfig({
  testDir: './test',
  testMatch: /.*\.e2e\.spec\.ts$/,
  fullyParallel: false, // PGLite does not support concurrent writers; run tests in series
  forbidOnly: isCi,
  retries: 0,
  workers: 1,
  reporter: isCi ? 'github' : 'list',
  globalSetup: './test/playwright-global-setup.ts',
  globalTeardown: './test/playwright-global-teardown.ts',
  use: {
    baseURL: apiUrl,
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
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
