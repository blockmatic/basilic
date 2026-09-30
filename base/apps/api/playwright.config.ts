import { defineConfig, devices } from "@playwright/test";

const isCi = !!process.env.CI;
const apiUrl =
  process.env.PLAYWRIGHT_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  forbidOnly: isCi,
  fullyParallel: false, // PGLite does not support concurrent writers; run tests in series
  globalSetup: "./test/playwright-global-setup.ts",
  globalTeardown: "./test/playwright-global-teardown.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: isCi ? "github" : "list",
  retries: 0,
  testDir: "./test",
  testMatch: /.*\.e2e\.spec\.ts$/,
  use: {
    baseURL: apiUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    ...(bypassSecret && {
      extraHTTPHeaders: {
        "x-vercel-protection-bypass": bypassSecret,
        "x-vercel-set-bypass-cookie": "true",
      },
    }),
  },
  workers: 1,
});
