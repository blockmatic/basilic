import { logger } from '@repo/utils/logger/server'

const pollTimeoutMs = 60_000
const pollIntervalMs = 500

const appUrl =
  process.env.PLAYWRIGHT_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const apiUrl =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const fetchHeaders = bypassSecret
  ? { 'x-vercel-protection-bypass': bypassSecret, 'x-vercel-set-bypass-cookie': 'true' }
  : undefined

async function waitForUrl(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000), headers: fetchHeaders })
      if (res.ok || res.status === 307) return true
    } catch {
      // continue polling
    }
    await new Promise(r => setTimeout(r, pollIntervalMs))
  }
  return false
}

async function globalSetup() {
  const [apiOk, appOk] = await Promise.all([
    waitForUrl(`${apiUrl}/health`, pollTimeoutMs),
    waitForUrl(appUrl, pollTimeoutMs),
  ])
  if (!apiOk) {
    logger.error(`E2E setup: API unreachable at ${apiUrl}/health after ${pollTimeoutMs}ms`)
    process.exit(1)
  }
  if (!appOk) {
    logger.error(`E2E setup: App unreachable at ${appUrl} after ${pollTimeoutMs}ms`)
    process.exit(1)
  }
}

// Playwright requires default export for globalSetup
// eslint-disable-next-line import/no-default-export
export default globalSetup
