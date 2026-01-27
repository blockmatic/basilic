/**
 * Vitest Global Setup
 *
 * Runs once before ALL test files/suites.
 * Sets up minimal environment variables for tests.
 * Database setup and migrations are handled per-worker in vitest.setup.ts.
 *
 * Note: Most test defaults are now handled by `src/lib/env.ts` which loads `.env.test`
 * and applies test-only defaults. This file only sets minimal, deterministic overrides.
 */

// Set NODE_ENV to 'test' to signal test context (env.ts uses this to detect test mode)
process.env.NODE_ENV = 'test'
// Force fake email provider for all tests (deterministic override)
process.env.USE_FAKE_EMAIL = 'true'

import type { GlobalSetupContext } from 'vitest/node'

export async function setup(_context: GlobalSetupContext) {
  // No global database setup needed
  // Each worker creates its own database in vitest.setup.ts
  return
}

export async function teardown() {
  // Workers clean up their own databases in vitest.setup.ts afterAll hook
  return
}
