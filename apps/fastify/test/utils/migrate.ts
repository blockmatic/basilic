import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { migrate as migratePGLite } from 'drizzle-orm/pglite/migrator'
import { getDb } from '../../src/db/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..', '..')

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

export async function runMigrations() {
  const db = await getDb()
  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')

  // Check if migrations directory exists and has files
  const migrationFiles = await readMigrationFiles()
  if (migrationFiles.length === 0) {
    // No migrations to run
    return
  }

  // Use appropriate migrator based on database type
  if (process.env.NODE_ENV === 'test') {
    // PGLite migrator
    await migratePGLite(db as PgliteDatabase, { migrationsFolder: migrationsDir })
  } else {
    // PostgreSQL migrator
    await migrate(db as NodePgDatabase, { migrationsFolder: migrationsDir })
  }
}
