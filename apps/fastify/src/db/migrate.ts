import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { migrate as migratePGLite } from 'drizzle-orm/pglite/migrator'
import { getDb } from './index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')

async function readMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')
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
 * Automatically detects environment and uses appropriate migrator (PGLite for tests, PostgreSQL for dev/prod)
 */
export async function runMigrations(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')

  // Check if migrations directory exists and has files
  const migrationFiles = await readMigrationFiles()
  if (migrationFiles.length === 0) {
    logger?.info('No migrations found, skipping migration step')
    return
  }

  logger?.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)

  try {
    const db = await getDb()
    const isTest = process.env.NODE_ENV === 'test'

    if (isTest) {
      // PGLite migrator for tests
      await migratePGLite(db as unknown as PgliteDatabase, { migrationsFolder: migrationsDir })
      logger?.info('Migrations completed successfully (PGLite)')
    } else {
      // PostgreSQL migrator for dev/prod
      await migrate(db as unknown as NodePgDatabase, { migrationsFolder: migrationsDir })
      logger?.info('Migrations completed successfully (PostgreSQL)')
    }
  } catch (err) {
    logger?.error('Migration failed', err)
    throw err
  }
}
