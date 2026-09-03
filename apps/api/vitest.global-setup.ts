/**
 * Vitest global setup — minimal env overrides before any worker starts.
 * Per-group PGLite setup runs in each inject project `.spec.ts` via db-setup.ts.
 */

process.env.NODE_ENV = 'test'
process.env.ALLOW_TEST = 'true'
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000,https://example.com'

import type { GlobalSetupContext } from 'vitest/node'

export async function setup(_context: GlobalSetupContext) {
  return
}

export async function teardown() {
  return
}
