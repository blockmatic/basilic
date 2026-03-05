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
 * Each group entry file gets its own isolated database instance.
 * Tests within the same group share the same database instance.
 * Different groups run in parallel with isolated databases.
 */

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resetDbInstance } from '../../src/db/index.js'
import { getTestDatabase, truncateAllTables } from './db.js'

const setupFile = fileURLToPath(import.meta.url)
const setupDir = dirname(setupFile)
// setupDir is apps/fastify/test/utils
// projectRoot is apps/fastify
const projectRoot = dirname(dirname(setupDir))

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
  // Reset database instance cache to ensure fresh connection
  resetDbInstance()

  const { instance } = await getTestDatabase()

  // Only run migrations once per worker
  // getTestDatabase() uses a singleton pattern, so multiple calls in the same worker
  // will get the same instance. We track migrations to avoid running them multiple times.
  // Use a promise to handle concurrent calls - all will wait for the same migration to complete
  if (!migrationsRun) {
    if (!migrationPromise)
      migrationPromise = (async () => {
        const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')

        const files = await readdir(migrationsDir)
        const migrationFiles = files.filter(f => f.endsWith('.sql')).sort()

        // Execute each migration SQL file directly on the PGLite instance
        // Remove statement-breakpoint markers and execute as a single SQL script
        // PGLite's exec() can handle multiple statements separated by semicolons
        // Wrap in try-catch to handle "relation already exists" errors gracefully
        for (const file of migrationFiles) {
          let sql = await readFile(join(migrationsDir, file), 'utf-8')
          // Remove all statement-breakpoint markers (they're just Drizzle metadata)
          sql = sql.replace(/--> statement-breakpoint\s*/gi, '\n').trim()
          try {
            await instance.exec(sql)
          } catch (error) {
            // Ignore "relation already exists" errors - migrations may have been run by another concurrent call
            const errorMessage = error instanceof Error ? error.message : String(error)
            if (!errorMessage.includes('already exists')) throw error
          }
        }

        migrationsRun = true
      })()

    await migrationPromise
  }

  // Reset Drizzle instance cache so it will be recreated with the migrated schema
  // This ensures any code that calls getDb() after migrations will get a fresh Drizzle instance
  resetDbInstance()
}

/**
 * Cleanup database for a group entry test file.
 * Truncates tables for next spec (does not close PGLite - that causes Aborted when reopening).
 */
export async function cleanupGroupDatabase() {
  await truncateAllTables()
  resetDbInstance()
}
