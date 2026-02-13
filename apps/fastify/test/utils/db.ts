/**
 * Test Database Utilities
 *
 * Manages per-worker file-based PGLite database instances for tests.
 * Each Vitest worker process gets its own isolated database directory and runs migrations independently.
 *
 * ## Lifecycle
 *
 * - **getTestDatabase()**: Gets or creates a per-worker PGLite file-based instance
 * - **resetTestDatabase()**: Closes existing instance and creates a fresh one (NOT used in tests)
 * - **closeTestDatabase()**: Closes the instance and cleans up the worker database directory
 *
 * ## Usage
 *
 * Used by `vitest.setup.ts` to manage database lifecycle per worker:
 * - **beforeAll()**: Calls `getTestDatabase()` to create worker instance, then runs migrations
 * - **Tests run**: Each worker has its own isolated database instance
 * - **afterAll()**: Calls `closeTestDatabase()` to clean up worker database after all tests in worker complete
 *
 * ## Important Notes
 *
 * - Per-worker pattern: Each Vitest worker gets its own database directory
 * - Database directory: `/tmp/basilic-fastify-test-db-{workerId}`
 * - Instance created once per worker before tests in that worker execute
 * - Instance deleted once per worker after all tests in that worker complete
 * - Workers are isolated - no shared state/data across workers
 * - File-based storage allows persistence during test execution
 *
 * @module test/utils/db
 */

import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

declare global {
  var __testPgliteInstance: PGlite | undefined
}

// Per-worker singleton pattern for test database - each worker gets its own instance
let pgLiteInstance: PGlite | null = null
let dbUrl: string | null = null

export const TEST_DATABASE_URL = 'postgresql://localhost/test'

/**
 * Get the database directory path for the current worker.
 * Uses VITEST_WORKER_ID if available, otherwise falls back to process PID.
 *
 * @returns Absolute path to worker-specific database directory
 */
function getWorkerDbDir(): string {
  // Vitest sets VITEST_WORKER_ID for each worker thread
  const workerId = process.env.VITEST_WORKER_ID || process.pid.toString()
  return join(tmpdir(), `basilic-fastify-test-db-${workerId}`)
}

/**
 * Get or create the test database instance for the current worker.
 * Returns a singleton PGlite file-based instance that persists until explicitly closed.
 * Each worker gets its own isolated database directory.
 *
 * @returns Database instance, connection URL, and database directory path
 */
export async function getTestDatabase() {
  if (!pgLiteInstance) {
    // Use in-memory PGLite - more stable than file-based with Vitest (avoids Aborted)
    pgLiteInstance = new PGlite()
    await pgLiteInstance.waitReady
    dbUrl = TEST_DATABASE_URL
    // Expose for getDb() to use same instance (avoids dynamic import resolution issues in Vitest)
    if (typeof globalThis !== 'undefined') {
      globalThis.__testPgliteInstance = pgLiteInstance
    }
  }
  return {
    instance: pgLiteInstance,
    url: dbUrl ?? TEST_DATABASE_URL,
    dir: getWorkerDbDir(),
  }
}

/** Tables to truncate (order respects FK: users referenced by others) */
const TABLES = ['account', 'sessions', 'wallet_identities', 'users', 'verification'] as const

/**
 * Truncate all tables. Keeps PGLite instance alive (creating a new one after close causes Aborted).
 * Use between spec files for clean state.
 */
export async function truncateAllTables() {
  if (!pgLiteInstance) return
  try {
    await pgLiteInstance.exec(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`)
  } catch {
    // Tables may not exist (e.g. db.spec runs without migrations)
  }
}

/**
 * Close and delete the test database instance and worker database directory.
 * NOTE: PGLite aborts when creating a second instance after close in the same process.
 * Prefer truncateAllTables() between specs; only call this when worker is exiting.
 */
export async function closeTestDatabase() {
  if (pgLiteInstance) {
    await pgLiteInstance.close()
    pgLiteInstance = null
    dbUrl = null
  }
}

/**
 * Reset the test database by truncating all tables.
 * Keeps instance alive (PGLite aborts when creating new instance after close).
 *
 * @returns Database instance and connection URL
 */
export async function resetTestDatabase() {
  await truncateAllTables()
  return await getTestDatabase()
}

/**
 * Setup helper - gets the test database instance.
 * Alias for getTestDatabase() for convenience.
 *
 * @returns Database instance
 */
export async function setupTestDatabase() {
  const { instance } = await getTestDatabase()
  return instance
}
