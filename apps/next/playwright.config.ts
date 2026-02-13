import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI
const reuseServer = process.env.PLAYWRIGHT_REUSE_SERVER === 'true'
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
      reuseExistingServer: reuseServer, // Set PLAYWRIGHT_REUSE_SERVER=true to use existing dev servers
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        USE_FAKE_EMAIL: 'true',
        PGLITE: 'true',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/test',
        JWT_SECRET: process.env.JWT_SECRET || 'e2e-jwt-secret-min-32-chars-for-tests',
        ...(process.env.OPEN_ROUTER_API_KEY && {
          OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY,
        }),
        NODE_ENV: 'test',
      },
    },
    {
      command: `PORT=${process.env.PORT || '3000'} pnpm start:e2e`,
      url: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
      reuseExistingServer: reuseServer, // Set PLAYWRIGHT_REUSE_SERVER=true to use existing dev servers
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      },
    },
  ],
})
