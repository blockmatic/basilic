import { afterEach, describe, expect, it, vi } from 'vitest'

const configureDb = vi.hoisted(() => vi.fn())
const runMigrations = vi.hoisted(() => vi.fn(async () => undefined))
const configureMarkets = vi.hoisted(() => vi.fn())
const configureOnchain = vi.hoisted(() => vi.fn())

vi.mock('@repo/db', () => ({ configureDb }))
vi.mock('@repo/db/migrate', () => ({ runMigrations }))
vi.mock('@repo/markets', () => ({ configureMarkets }))
vi.mock('@repo/onchain', () => ({ configureOnchain }))
vi.mock('@repo/utils/logger/server', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}))

describe('bootHost', () => {
  afterEach(() => {
    delete (globalThis as { __basilicEveHostBoot?: Promise<void> }).__basilicEveHostBoot
    vi.resetModules()
    configureDb.mockClear()
    runMigrations.mockClear()
  })

  it('runs migrations once across a second compiled module instance', async () => {
    await import('./host.js')
    expect(configureDb).toHaveBeenCalledTimes(1)
    expect(runMigrations).toHaveBeenCalledTimes(1)
    vi.resetModules()
    await import('./host.js')
    expect(configureDb).toHaveBeenCalledTimes(1)
    expect(runMigrations).toHaveBeenCalledTimes(1)
  })

  it('skips database boot during eve host build', async () => {
    vi.stubEnv('EVE_INTERNAL_HOST_BUILD_OUTPUT_DIRECTORY', '../../.vercel/output')
    await import('./host.js')
    expect(configureMarkets).toHaveBeenCalledTimes(1)
    expect(configureDb).not.toHaveBeenCalled()
    expect(runMigrations).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('passes VERCEL_ENV into runMigrations', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    await import('./host.js')
    expect(runMigrations).toHaveBeenCalledWith(
      expect.objectContaining({ vercelEnv: 'preview', nodeEnv: expect.any(String) }),
    )
    vi.unstubAllEnvs()
  })
})
