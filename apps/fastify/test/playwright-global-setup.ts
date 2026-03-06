import { logger } from '@repo/utils/logger/server'

const PollTimeoutMs = 60_000
const PollIntervalMs = 500

const apiUrl =
  process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function waitForUrl(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
      if (res.ok || res.status === 307) return true
    } catch {
      // continue polling
    }
    await new Promise(r => setTimeout(r, PollIntervalMs))
  }
  return false
}

async function globalSetup() {
  const apiOk = await waitForUrl(`${apiUrl}/health`, PollTimeoutMs)
  if (!apiOk) {
    logger.error(`E2E setup: API unreachable at ${apiUrl}/health after ${PollTimeoutMs}ms`)
    process.exit(1)
  }
}

// Playwright requires default export for globalSetup
export default globalSetup
