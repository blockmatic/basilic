/**
 * Database Setup Utility for Group Entry Test Files
 *
 * Provides reusable DB setup function for group entry `.spec.ts` files.
 * Each group entry file owns its DB lifecycle and calls this to set up the database.
 *
 * ## Usage
 *
 * ```typescript
 * import { setupGroupDatabase, cleanupGroupDatabase } from '../../../test/utils/db-setup.js'
 *
 * beforeAll(async () => {
 *   await setupGroupDatabase()
 *   fastify = await buildTestApp()
 * })
 *
 * afterAll(async () => {
 *   await fastify.close()
 *   await cleanupGroupDatabase()
 * })
 * ```
 *
 * ## Lifecycle
 *
 * - `setupGroupDatabase()`: Creates DB instance, runs migrations, returns cleanup function
 * - `cleanupGroupDatabase()`: Closes DB instance and cleans up directory
 *
 * Each group entry file shares one PGLite instance per inject worker (maxWorkers: 1).
 * Tables are truncated between group specs; PGLite is not reopened per test.
 */

import { configureDb, resetDbInstance } from '@repo/db'
import { runMigrations } from '@repo/db/migrate'
import { clearSessionPool } from './auth-helper.js'
import { getTestDatabase, truncateAllTables } from './db.js'

// Track if migrations have been run in this worker
// Since getTestDatabase() uses a singleton pattern per worker,
// we need to ensure migrations only run once per worker
let migrationsRun = false
let migrationPromise: Promise<void> | null = null

/**
 * Setup database for a group entry test file.
 * Creates DB instance, runs migrations (once per worker), and resets Drizzle instance cache.
 *
 * Note: Migrations are run once per worker. If multiple group entry files run in the same worker,
 * migrations will only run once (on the first call). Concurrent calls will wait for the first migration to complete.
 */
export async function setupGroupDatabase() {
  resetDbInstance()

  const { instance } = await getTestDatabase()
  configureDb({ pglite: true, pgliteInstance: instance })

  if (!migrationsRun) {
    if (!migrationPromise)
      migrationPromise = (async () => {
        await runMigrations()
        migrationsRun = true
      })()

    await migrationPromise
  }

  resetDbInstance()
}

/**
 * Cleanup database for a group entry test file.
 * Truncates tables for next spec (does not close PGLite - that causes Aborted when reopening).
 */
export async function cleanupGroupDatabase() {
  clearSessionPool()
  await truncateAllTables()
  resetDbInstance()
}
