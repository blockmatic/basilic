/**
 * Vitest Global Setup
 *
 * Runs once before ALL test files/suites.
 * Sets up environment variables for tests.
 * Database setup and migrations are handled per-worker in vitest.setup.ts.
 */

// Set all required environment variables before env validation
// This must happen before any imports that use env.ts
process.env.NODE_ENV = 'test'
// Always use test database URL in test environment, overriding .env file
process.env.DATABASE_URL = 'postgresql://localhost/test'
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key'
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || '0000000000000000000000000000000000000000000000000000000000000000'
// Better Auth configuration for tests
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || 'test-secret-key-that-is-at-least-32-characters-long'
process.env.BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3000}`
process.env.BETTER_AUTH_TRUSTED_ORIGINS = process.env.BETTER_AUTH_TRUSTED_ORIGINS || ''
// Email configuration for tests
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_test_key'
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'test@example.com'
process.env.EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Test App'

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
