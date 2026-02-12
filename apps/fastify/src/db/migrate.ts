import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PGlite } from '@electric-sql/pglite'
import { getDb } from '@/db/index.js'
import { env } from '@/lib/env.js'

const migrateFile = fileURLToPath(import.meta.url)
const dbDir = dirname(migrateFile)
// migrationsDir is relative to this file: src/db/migrate.ts
// So migrations are at: src/db/migrations (same level as migrate.ts)
const migrationsDir = join(dbDir, 'migrations')

async function readMigrationFiles(migrationDir: string): Promise<string[]> {
  try {
    const files = await readdir(migrationDir)
    return files.filter(file => file.endsWith('.sql')).sort()
  } catch {
    // Migrations directory doesn't exist yet
    return []
  }
}

/**
 * Run database migrations
 * Supports build-time migrations for PostgreSQL and runtime migrations for PGLite
 * - PostgreSQL: Migrations run at build time via `pnpm db:migrate` → `pnpm build`
 *   Migrations are skipped at runtime (already applied at build time)
 * - PGLite: Migrations run at runtime when instance is created
 */
export async function runMigrations(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  const migrationFiles = await readMigrationFiles(migrationsDir)

  if (migrationFiles.length === 0) {
    logger?.info('No migrations found, skipping migration step')
    return
  }

  try {
    const shouldUsePGLite = env.PGLITE === true || env.NODE_ENV === 'test'

    if (shouldUsePGLite) {
      // PGLite: Run migrations at runtime when instance is created
      logger?.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)
      const db = await getDb()

      // Instead of using migratePGLite (which silently fails):
      // await migratePGLite(db as unknown as PgliteDatabase, { migrationsFolder: migrationsDir })

      // Execute SQL directly on PGLite instance
      // Get the underlying PGLite instance from the Drizzle connection
      // For test mode: instance comes from getTestDatabase() singleton
      // For runtime mode: instance is stored in pgLiteInstance variable in index.ts
      let pgliteInstance: PGlite

      if (env.NODE_ENV === 'test') {
        // In test mode, get instance from test utils singleton
        const { getTestDatabase } = await import('../../test/utils/db.js')
        const { instance } = await getTestDatabase()
        pgliteInstance = instance
      } else {
        // In runtime mode, get instance from db connection
        // The instance is available at db._.session.client for PGLite connections
        // Accessing internal Drizzle structure - not part of public API
        pgliteInstance = (db as unknown as { _: { session: { client: PGlite } } })._.session.client
      }

      // Read and execute each migration SQL file
      // Remove statement-breakpoint markers and execute as a single SQL script
      // PGLite's exec() can handle multiple statements separated by semicolons
      for (const file of migrationFiles) {
        const sqlPath = join(migrationsDir, file)
        let sql = await readFile(sqlPath, 'utf-8')
        // Remove all statement-breakpoint markers (they're just Drizzle metadata)
        sql = sql.replace(/--> statement-breakpoint\s*/gi, '\n').trim()

        // Execute the entire SQL file - PGLite handles multiple statements
        await pgliteInstance.exec(sql)
      }

      logger?.info('Migrations completed successfully (PGLite)')
    } else {
      // PostgreSQL: Migrations already ran at build time, skip at runtime
      logger?.info(
        'PostgreSQL detected: migrations already applied at build time, skipping runtime migrations',
      )
      return
    }
  } catch (err) {
    logger?.error('Migration failed', err)
    throw err
  }
}
