import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { migrate as migratePGLite } from 'drizzle-orm/pglite/migrator'
import { env } from '../lib/env.js'
import { getDb } from './index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')
const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')

async function readMigrationFiles(): Promise<string[]> {
  try {
    const files = await readdir(migrationsDir)
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
  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')
  const migrationFiles = await readMigrationFiles()

  if (migrationFiles.length === 0) {
    logger?.info('No migrations found, skipping migration step')
    return
  }

  logger?.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)

  try {
    const shouldUsePGLite = env.PGLITE === true || env.NODE_ENV === 'test'

    if (shouldUsePGLite) {
      // PGLite: Run migrations at runtime when instance is created
      const db = await getDb()
      await migratePGLite(db as unknown as PgliteDatabase, {
        migrationsFolder: migrationsDir,
      })
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
