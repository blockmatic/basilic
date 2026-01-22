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

import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

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
    const dbDir = getWorkerDbDir()
    // Use file-based PGLite with worker-specific directory
    // Each worker gets its own isolated database
    pgLiteInstance = new PGlite(dbDir)
    await pgLiteInstance.waitReady
    // Generate connection string compatible with PostgreSQL clients
    dbUrl = TEST_DATABASE_URL
  }
  return {
    instance: pgLiteInstance,
    url: dbUrl ?? TEST_DATABASE_URL,
    dir: getWorkerDbDir(),
  }
}

/**
 * Close and delete the test database instance and worker database directory.
 * This ensures clean state and frees disk space.
 * Called in `vitest.setup.ts` afterAll hook to clean up after all tests in worker complete.
 */
export async function closeTestDatabase() {
  if (pgLiteInstance) {
    const dbDir = getWorkerDbDir()
    await pgLiteInstance.close()
    pgLiteInstance = null
    dbUrl = null

    // Clean up worker database directory
    try {
      await rm(dbDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors (directory might not exist or already deleted)
    }
  }
}

/**
 * Reset the test database by closing existing instance and creating a fresh one.
 * This ensures a completely clean database.
 *
 * **Note**: This is NOT used in the standard test setup. The test suite uses a single
 * shared instance created in global setup. Only use this if you need to reset the
 * database mid-test (not recommended).
 *
 * @returns Fresh database instance and connection URL
 */
export async function resetTestDatabase() {
  // Always close and recreate for fresh database
  await closeTestDatabase()
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
