import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb, getPgliteClient, isPgliteConfigured } from './client.js'

const migrateFile = fileURLToPath(import.meta.url)
export const migrationsDir = join(dirname(migrateFile), 'migrations')

async function readMigrationFiles(migrationDir: string): Promise<string[]> {
  try {
    const files = await readdir(migrationDir)
    return files.filter(file => file.endsWith('.sql')).sort()
  } catch {
    return []
  }
}

/**
 * Run PGLite SQL migrations from this package. PostgreSQL applies migrations at
 * build time via `apps/api` `scripts/migrate.ts` and skips here.
 */
export async function runMigrations(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  const pglite = isPgliteConfigured()
  const migrationFiles = await readMigrationFiles(migrationsDir)

  if (migrationFiles.length === 0) {
    if (pglite)
      throw new Error(
        `No SQL migrations found in ${migrationsDir}. Compiled PGLite/test starts require copied migration assets.`,
      )
    logger?.info('No migrations found, skipping migration step')
    return
  }

  try {
    if (!pglite) {
      logger?.info(
        'PostgreSQL detected: migrations already applied at build time, skipping runtime migrations',
      )
      return
    }

    logger?.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)
    await getDb()
    const pgliteInstance = getPgliteClient()
    if (!pgliteInstance) throw new Error('PGLite client missing after getDb()')

    for (const file of migrationFiles) {
      const sqlPath = join(migrationsDir, file)
      let sql = await readFile(sqlPath, 'utf-8')
      sql = sql.replace(/--> statement-breakpoint\s*/gi, '\n').trim()
      try {
        await pgliteInstance.exec(sql)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (!errorMessage.includes('already exists')) throw error
      }
    }

    logger?.info('Migrations completed successfully (PGLite)')
  } catch (err) {
    logger?.error('Migration failed', err)
    throw err
  }
}
