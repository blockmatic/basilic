import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import type { Pool } from 'pg'

export type MigrateLogger = {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
  warn?: (msg: string, err?: unknown) => void
}

const migrationLockClassid = 1_882_746_001
const migrationLockObjid = 1
const requiredBootstrapTables = [
  'users',
  'sessions',
  'verification',
  'account',
  'wallet_identities',
]

export async function readSqlMigrationFiles(migrationsDir: string): Promise<string[]> {
  try {
    const files = await readdir(migrationsDir)
    return files.filter(file => file.endsWith('.sql')).sort()
  } catch {
    return []
  }
}

async function publicTableExists({
  pool,
  tableName,
}: {
  pool: Pool
  tableName: string
}): Promise<boolean> {
  const result = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
    [tableName],
  )
  return result.rows[0]?.exists ?? false
}

async function initMigrationsTrackingWhenTablesExist({
  pool,
  migrationsDir,
  migrationFiles,
  logger,
}: {
  pool: Pool
  migrationsDir: string
  migrationFiles: string[]
  logger?: MigrateLogger
}): Promise<void> {
  const firstMigrationFile = migrationFiles[0]
  if (!firstMigrationFile) return

  const migrationContent = readFileSync(join(migrationsDir, firstMigrationFile), 'utf-8')
  const hash = createHash('sha256').update(migrationContent).digest('hex')
  await pool.query(
    `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [hash, Date.now()],
  )
  logger?.info('Migrations tracking initialized. Existing migration marked as applied.')
}

async function bootstrapMigrationTracking({
  pool,
  migrationsDir,
  migrationFiles,
  logger,
}: {
  pool: Pool
  migrationsDir: string
  migrationFiles: string[]
  logger?: MigrateLogger
}): Promise<{ migrationsTableExists: boolean; allTablesExist: boolean }> {
  const migrationsTableExists = await publicTableExists({
    pool,
    tableName: '__drizzle_migrations',
  })
  if (migrationsTableExists) {
    logger?.info('Migrations tracking table exists, running migrations...')
    return { migrationsTableExists: true, allTablesExist: false }
  }

  const tableChecks = await Promise.all(
    requiredBootstrapTables.map(tableName => publicTableExists({ pool, tableName })),
  )
  const allTablesExist = tableChecks.every(Boolean)
  if (!allTablesExist) {
    logger?.info('Some tables are missing, running migrations...')
    return { migrationsTableExists: false, allTablesExist: false }
  }

  logger?.info(
    'All required tables exist but migrations tracking not initialized. Initializing migrations tracking...',
  )
  await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `)
  await initMigrationsTrackingWhenTablesExist({ pool, migrationsDir, migrationFiles, logger })
  return { migrationsTableExists: false, allTablesExist: true }
}

function isTableAlreadyExistsError(migrationError: unknown): boolean {
  const errorMessage =
    migrationError instanceof Error ? migrationError.message : String(migrationError)
  return errorMessage.includes('already exists')
}

function handleMigrateError({
  migrationError,
  allTablesExist,
  migrationsTableExists,
  logger,
  nodeEnv,
}: {
  migrationError: unknown
  allTablesExist: boolean
  migrationsTableExists: boolean
  logger?: MigrateLogger
  nodeEnv?: string
}): void {
  if (!isTableAlreadyExistsError(migrationError)) {
    logger?.error('Migration failed', migrationError)
    throw migrationError
  }

  if (allTablesExist && !migrationsTableExists) {
    logger?.info(
      'Migration error expected - tables exist and migration is now tracked. Migration state is consistent.',
    )
    return
  }

  logger?.warn?.(
    'Migration failed due to existing tables. Tables appear to match schema. For a wipe, run: pnpm reset',
    migrationError,
  )
  if (nodeEnv === 'production') throw migrationError
  logger?.info(
    'Allowing continue - tables exist and appear to match expected schema. Consider pnpm reset for a clean migration state.',
  )
}

async function runDrizzleMigrate({
  pool,
  migrationsDir,
  migrationsTableExists,
  allTablesExist,
  logger,
  nodeEnv,
}: {
  pool: Pool
  migrationsDir: string
  migrationsTableExists: boolean
  allTablesExist: boolean
  logger?: MigrateLogger
  nodeEnv?: string
}): Promise<void> {
  try {
    await migrate(drizzle(pool), { migrationsFolder: migrationsDir })
    logger?.info('Migrations completed successfully (PostgreSQL)')
  } catch (migrationError: unknown) {
    handleMigrateError({
      migrationError,
      allTablesExist,
      migrationsTableExists,
      logger,
      nodeEnv,
    })
  }
}

async function withMigrationLock({
  pool,
  logger,
  run,
}: {
  pool: Pool
  logger?: MigrateLogger
  run: () => Promise<void>
}): Promise<void> {
  const lockClient = await pool.connect()
  try {
    await lockClient.query('SELECT pg_advisory_lock($1, $2)', [
      migrationLockClassid,
      migrationLockObjid,
    ])
    logger?.info('Acquired PostgreSQL advisory lock for migrations')
    await run()
  } finally {
    try {
      await lockClient.query('SELECT pg_advisory_unlock($1, $2)', [
        migrationLockClassid,
        migrationLockObjid,
      ])
    } catch (unlockError) {
      logger?.error('Failed to release migration advisory lock', unlockError)
    }
    lockClient.release()
  }
}

export async function runPostgresMigrations({
  pool,
  migrationsDir,
  logger,
  nodeEnv,
}: {
  pool: Pool
  migrationsDir: string
  logger?: MigrateLogger
  nodeEnv?: string
}): Promise<void> {
  const migrationFiles = await readSqlMigrationFiles(migrationsDir)
  if (migrationFiles.length === 0) {
    logger?.info('No migrations found, skipping migration step')
    return
  }

  logger?.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)
  await withMigrationLock({
    pool,
    logger,
    run: async () => {
      const { migrationsTableExists, allTablesExist } = await bootstrapMigrationTracking({
        pool,
        migrationsDir,
        migrationFiles,
        logger,
      })
      await runDrizzleMigrate({
        pool,
        migrationsDir,
        migrationsTableExists,
        allTablesExist,
        logger,
        nodeEnv,
      })
    },
  })
}
