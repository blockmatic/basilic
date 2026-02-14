import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI

export default defineConfig({
  testDir: './test',
  testMatch: /.*\.e2e\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? 'github' : 'list',
  globalSetup: './test/playwright-global-setup.ts',
  globalTeardown: './test/playwright-global-teardown.ts',
  use: {
    baseURL: process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm start:ci',
    url: 'http://localhost:3001/health',
    reuseExistingServer: !isCi,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      USE_FAKE_EMAIL: 'true',
      PGLITE: 'true',
    },
  },
})
