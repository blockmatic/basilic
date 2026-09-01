#!/usr/bin/env node
/**
 * Build-time migration script for Fastify (PostgreSQL only).
 *
 * Wraps Drizzle's migrator with project-specific logic:
 * - PGLite: Skips here; migrations run at runtime via src/db/migrate.ts
 * - PostgreSQL: Runs migrations at build time (skipped on Vercel Preview unless `RUN_PG_MIGRATE=true`)
 * - Bootstrap: Initializes __drizzle_migrations for DBs that have tables but no migration history
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger/server'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../src/lib/env.js'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = dirname(scriptFile)
const projectRoot = join(scriptDir, '..')

/** Session advisory-lock pair so concurrent migrators serialize (int4, int4). */
const migrationLockClassid = 1_882_746_001
const migrationLockObjid = 1
const requiredBootstrapTables = [
  'users',
  'sessions',
  'verification',
  'account',
  'wallet_identities',
]

/** Read sorted .sql migration files from src/db/migrations. */
async function readMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')
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

/** Mark the first migration as applied when DB has tables but no __drizzle_migrations (e.g. restored dump). */
async function initMigrationsTrackingWhenTablesExist({
  pool,
  migrationsDir,
  migrationFiles,
}: {
  pool: Pool
  migrationsDir: string
  migrationFiles: string[]
}): Promise<void> {
  const firstMigrationFile = migrationFiles[0]
  if (!firstMigrationFile) return

  // Same hash format Drizzle uses for migration tracking
  const migrationContent = readFileSync(join(migrationsDir, firstMigrationFile), 'utf-8')
  const hash = createHash('sha256').update(migrationContent).digest('hex')
  await pool.query(
    `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [hash, Date.now()],
  )
  logger.info(
    { context: 'migrate' },
    'Migrations tracking initialized. Existing migration marked as applied.',
  )
}

async function bootstrapMigrationTracking({
  pool,
  migrationsDir,
  migrationFiles,
}: {
  pool: Pool
  migrationsDir: string
  migrationFiles: string[]
}): Promise<{ migrationsTableExists: boolean; allTablesExist: boolean }> {
  try {
    const migrationsTableExists = await publicTableExists({
      pool,
      tableName: '__drizzle_migrations',
    })
    if (migrationsTableExists) {
      logger.info({ context: 'migrate' }, 'Migrations tracking table exists, running migrations...')
      return { migrationsTableExists: true, allTablesExist: false }
    }

    const tableChecks = await Promise.all(
      requiredBootstrapTables.map(tableName => publicTableExists({ pool, tableName })),
    )
    const allTablesExist = tableChecks.every(Boolean)
    if (!allTablesExist) {
      logger.info({ context: 'migrate' }, 'Some tables are missing, running migrations...')
      return { migrationsTableExists: false, allTablesExist: false }
    }

    logger.info(
      { context: 'migrate' },
      'All required tables exist but migrations tracking not initialized. Initializing migrations tracking...',
    )
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `)
    await initMigrationsTrackingWhenTablesExist({ pool, migrationsDir, migrationFiles })
    return { migrationsTableExists: false, allTablesExist: true }
  } catch (checkError) {
    logger.error({ context: 'migrate', err: checkError }, 'Failed to check table existence')
    throw checkError
  }
}

function isTableAlreadyExistsError(migrationError: unknown): boolean {
  const errorMessage =
    migrationError instanceof Error ? migrationError.message : String(migrationError)
  return (
    errorMessage.includes('already exists') ||
    (errorMessage.includes('relation') && errorMessage.includes('already exists'))
  )
}

function handleMigrateError({
  migrationError,
  allTablesExist,
  migrationsTableExists,
}: {
  migrationError: unknown
  allTablesExist: boolean
  migrationsTableExists: boolean
}): void {
  if (!isTableAlreadyExistsError(migrationError)) {
    logger.error({ context: 'migrate', err: migrationError }, 'Migration failed')
    throw migrationError
  }

  if (allTablesExist && !migrationsTableExists) {
    logger.info(
      { context: 'migrate' },
      'Migration error expected - tables exist and migration is now tracked. Migration state is consistent.',
    )
    return
  }

  logger.warn(
    { context: 'migrate', err: migrationError },
    'Migration failed due to existing tables. Tables appear to match schema. For clean state, run: pnpm --filter @repo/api reset',
  )
  if (process.env.NODE_ENV === 'production') throw migrationError

  logger.info(
    { context: 'migrate' },
    'Allowing build to continue - tables exist and appear to match expected schema. Consider running pnpm reset for clean migration state.',
  )
}

async function runDrizzleMigrate({
  pool,
  migrationsDir,
  migrationsTableExists,
  allTablesExist,
}: {
  pool: Pool
  migrationsDir: string
  migrationsTableExists: boolean
  allTablesExist: boolean
}): Promise<void> {
  try {
    await migrate(drizzle(pool), { migrationsFolder: migrationsDir })
    logger.info({ context: 'migrate' }, 'Migrations completed successfully (PostgreSQL)')
  } catch (migrationError: unknown) {
    handleMigrateError({ migrationError, allTablesExist, migrationsTableExists })
  }
}

async function withMigrationLock({
  pool,
  run,
}: {
  pool: Pool
  run: () => Promise<void>
}): Promise<void> {
  const lockClient = await pool.connect()
  try {
    await lockClient.query('SELECT pg_advisory_lock($1, $2)', [
      migrationLockClassid,
      migrationLockObjid,
    ])
    logger.info({ context: 'migrate' }, 'Acquired PostgreSQL advisory lock for migrations')
    await run()
  } finally {
    try {
      await lockClient.query('SELECT pg_advisory_unlock($1, $2)', [
        migrationLockClassid,
        migrationLockObjid,
      ])
    } catch (unlockError) {
      logger.error(
        { context: 'migrate', err: unlockError },
        'Failed to release migration advisory lock',
      )
    }
    lockClient.release()
  }
}

try {
  // --- PGLite vs PostgreSQL ---
  // Allow explicit override: RUN_PG_MIGRATE=true forces PostgreSQL path (e.g. after pnpm reset)
  const forcePg = process.env.RUN_PG_MIGRATE === 'true'
  const shouldUsePGLite = !forcePg && (env.PGLITE === true || env.NODE_ENV === 'test')

  if (shouldUsePGLite) {
    // PGLite: Skip migrations at build time (they run at runtime)
    logger.info(
      { context: 'migrate' },
      'PGLite detected: migrations will run at runtime when instance is created',
    )
    process.exit(0)
  }

  // Preview builds must not migrate a shared Production DATABASE_URL.
  // Isolated Preview DBs can opt in with RUN_PG_MIGRATE=true.
  if (process.env.VERCEL_ENV === 'preview' && !forcePg) {
    logger.info(
      { context: 'migrate', vercelEnv: 'preview' },
      'Skipping PostgreSQL migrations on Vercel Preview. Set RUN_PG_MIGRATE=true with an isolated DATABASE_URL to apply Preview migrations.',
    )
    process.exit(0)
  }

  // PostgreSQL: Run migrations at build time
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required when PGLITE is false')

  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')
  const migrationFiles = await readMigrationFiles()

  if (migrationFiles.length === 0) {
    logger.info({ context: 'migrate' }, 'No migrations found, skipping migration step')
    process.exit(0)
  }

  logger.info(
    { context: 'migrate' },
    `Found ${migrationFiles.length} migration file(s), running migrations...`,
  )

  const pool = new Pool({ connectionString: env.DATABASE_URL })
  try {
    await withMigrationLock({
      pool,
      run: async () => {
        const { migrationsTableExists, allTablesExist } = await bootstrapMigrationTracking({
          pool,
          migrationsDir,
          migrationFiles,
        })
        await runDrizzleMigrate({
          pool,
          migrationsDir,
          migrationsTableExists,
          allTablesExist,
        })
      },
    })
  } finally {
    await pool.end()
  }

  process.exit(0)
} catch (err) {
  logger.error({ context: 'migrate', err }, 'Migration failed')
  process.exit(1)
}
