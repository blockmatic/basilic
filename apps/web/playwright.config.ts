import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI
const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const authFile = path.join(process.cwd(), 'test-results', '.auth', 'user.json')
const emptyStorage = { cookies: [] as [], origins: [] as [] }

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: 1,
  reporter: isCi ? [['github'], ['html']] : 'list',
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
      name: 'public',
      testMatch: ['**/public.spec.ts'],
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'auth',
      testMatch: [
        '**/01-callbacks.spec.ts',
        '**/02-magic-link-auth.spec.ts',
        '**/03-proxy-gate.spec.ts',
        '**/04-update-tokens.spec.ts',
        '**/05-change-email.spec.ts',
        '**/06-logout.spec.ts',
      ],
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'], storageState: emptyStorage },
      dependencies: ['public'],
    },
    {
      name: 'setup',
      testMatch: ['**/auth.setup.ts'],
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'], storageState: emptyStorage },
      dependencies: ['public'],
    },
    {
      name: 'chromium',
      testMatch: ['**/dashboard.spec.ts'],
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },
    {
      name: 'security',
      testMatch: [
        '**/security/authenticator.spec.ts',
        '**/security/passkeys.spec.ts',
        '**/security/api-keys.spec.ts',
      ],
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },
    {
      name: 'passkey-login',
      testMatch: ['**/passkey-auth.spec.ts'],
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'], storageState: emptyStorage },
      dependencies: ['security'],
    },
    {
      name: 'chat',
      testMatch: ['**/chat-assistant.spec.ts'],
      timeout: 90_000,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
        viewport: { width: 375, height: 667 },
      },
      dependencies: ['chromium'],
    },
  ],
})
