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
// Force ALLOW_TEST for unit tests (fake email + DB-backed token for @test.ai)
process.env.ALLOW_TEST = 'true'
// Pin explicit origins so passkey origin tests are not no-ops under * or inherited CI values.
// Include https://example.com for magic-link / auth-helper callback URLs in tests.
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000,https://example.com'

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
