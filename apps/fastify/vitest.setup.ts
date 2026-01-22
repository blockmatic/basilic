/**
 * Vitest Test Setup
 *
 * Runs before each test file in each worker.
 * Each Vitest worker creates its own isolated database and runs migrations independently.
 *
 * ## Test Database Lifecycle
 *
 * Per-worker file-based PGLite databases:
 *
 * 1. **beforeAll()**: Creates a worker-specific database instance and runs migrations (once per worker)
 * 2. **Tests run**: All test files in the same worker share the same database instance
 *    - Tests within a worker can share state/data if needed
 *    - Different workers have isolated databases
 * 3. **afterAll()**: Closes and deletes the worker database instance after all tests in worker complete
 *
 * ## Important Notes
 *
 * - Database instance is created once per worker before test files in that worker execute
 * - Database instance is deleted once per worker after all tests in that worker complete (handles test failures too)
 * - Each worker gets its own database directory: `/tmp/basilic-fastify-test-db-{workerId}`
 * - Workers are isolated - no shared state/data across workers
 * - No `afterEach` hook - data persists across tests within a worker to allow test dependencies
 * - Tests should clean up their own data if needed, or rely on the afterAll cleanup
 */

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll } from 'vitest'
import { resetDbInstance } from './src/db/index.js'
import { closeTestDatabase, getTestDatabase } from './test/utils/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Run migrations once per worker before any tests in this worker
beforeAll(async () => {
  // Reset database instance cache to ensure fresh connection
  resetDbInstance()

  const { instance } = await getTestDatabase()
  const migrationsDir = join(__dirname, 'src', 'db', 'migrations')

  const files = await readdir(migrationsDir)
  const migrationFiles = files.filter(f => f.endsWith('.sql')).sort()

  // Execute each migration SQL file directly on the PGLite instance
  // Remove statement-breakpoint markers and execute as a single SQL script
  // PGLite's exec() can handle multiple statements separated by semicolons
  for (const file of migrationFiles) {
    let sql = await readFile(join(migrationsDir, file), 'utf-8')
    // Remove all statement-breakpoint markers (they're just Drizzle metadata)
    sql = sql.replace(/--> statement-breakpoint\s*/gi, '\n').trim()
    await instance.exec(sql)
  }

  // Reset Drizzle instance cache so it will be recreated with the migrated schema
  // This ensures any code that calls getDb() after migrations will get a fresh Drizzle instance
  resetDbInstance()
})

// Clean up worker database after all tests in this worker complete
afterAll(async () => {
  await closeTestDatabase()
  resetDbInstance()
})
