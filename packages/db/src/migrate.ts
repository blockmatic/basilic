import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb, getPgliteClient, getPgPool, isPgliteConfigured } from './client.js'
import {
  type MigrateLogger,
  readSqlMigrationFiles,
  runPostgresMigrations,
} from './postgres-migrate.js'

const migrateFile = fileURLToPath(import.meta.url)
export const migrationsDir = join(dirname(migrateFile), 'migrations')

export type { MigrateLogger }
export { runPostgresMigrations }

export function shouldApplyPostgresAtRuntime({
  nodeEnv,
  vercelEnv,
}: {
  nodeEnv?: string
  vercelEnv?: string
} = {}): boolean {
  if (nodeEnv === 'production') return false
  if (vercelEnv === 'preview') return false
  return true
}

async function applyPgliteFiles({
  migrationFiles,
  logger,
}: {
  migrationFiles: string[]
  logger?: MigrateLogger
}): Promise<void> {
  logger?.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)
  await getDb()
  const pgliteInstance = getPgliteClient()
  if (!pgliteInstance) throw new Error('PGLite client missing after getDb()')

  for (const file of migrationFiles) {
    const sqlPath = join(migrationsDir, file)
    const sql = (await readFile(sqlPath, 'utf-8'))
      .replace(/--> statement-breakpoint\s*/gi, '\n')
      .trim()
    try {
      await pgliteInstance.exec(sql)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('already exists')) throw error
    }
  }

  logger?.info('Migrations completed successfully (PGLite)')
}

/**
 * PGLite: apply SQL at runtime. PostgreSQL: apply at runtime in development;
 * production and Vercel Preview skip (build-time `db:migrate`).
 */
export async function runMigrations({
  logger,
  nodeEnv,
  vercelEnv,
}: {
  logger?: MigrateLogger
  nodeEnv?: string
  vercelEnv?: string
} = {}): Promise<void> {
  const pglite = isPgliteConfigured()
  const migrationFiles = await readSqlMigrationFiles(migrationsDir)

  if (migrationFiles.length === 0) {
    if (pglite)
      throw new Error(
        `No SQL migrations found in ${migrationsDir}. Compiled PGLite/test starts require copied migration assets.`,
      )
    logger?.info('No migrations found, skipping migration step')
    return
  }

  try {
    if (pglite) {
      await applyPgliteFiles({ migrationFiles, logger })
      return
    }

    if (!shouldApplyPostgresAtRuntime({ nodeEnv, vercelEnv })) {
      logger?.info(
        'PostgreSQL detected: migrations already applied at build time, skipping runtime migrations',
      )
      return
    }

    await getDb()
    const pool = getPgPool()
    if (!pool) throw new Error('PostgreSQL pool missing after getDb()')
    await runPostgresMigrations({ pool, migrationsDir, logger, nodeEnv })
  } catch (err) {
    logger?.error('Migration failed', err)
    throw err
  }
}
