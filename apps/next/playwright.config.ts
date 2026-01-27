import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI
const htmlReportOpenEnv = process.env.PLAYWRIGHT_HTML_REPORT_OPEN
const htmlReportOpen =
  htmlReportOpenEnv === 'always' ||
  htmlReportOpenEnv === 'never' ||
  htmlReportOpenEnv === 'on-failure'
    ? htmlReportOpenEnv
    : 'never'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? 'github' : [['html', { open: htmlReportOpen }]],
  globalSetup: './e2e/playwright-global-setup.ts',
  globalTeardown: './e2e/playwright-global-teardown.ts',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @repo/fastify start:ci',
      url: 'http://localhost:3001/health',
      reuseExistingServer: false, // Always start fresh to ensure USE_FAKE_EMAIL=true
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        USE_FAKE_EMAIL: 'true',
        PGLITE: 'true',
      },
    },
    {
      command: `PORT=${process.env.PORT || '3000'} pnpm start:e2e`,
      url: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
      reuseExistingServer: false, // Always start fresh to ensure correct env vars
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      },
    },
  ],
})
