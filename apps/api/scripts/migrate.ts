#!/usr/bin/env node
/**
 * Build-time migration script for Fastify (PostgreSQL only).
 *
 * Wraps Drizzle's migrator with project-specific logic:
 * - PGLite: Skips here; migrations run at runtime via src/db/migrate.ts
 * - PostgreSQL: Runs migrations at build time (invoked by `pnpm build`)
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

/** Mark the first migration as applied when DB has tables but no __drizzle_migrations (e.g. restored dump). */
async function initMigrationsTrackingWhenTablesExist(
  pool: Pool,
  migrationsDir: string,
  migrationFiles: string[],
): Promise<void> {
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

try {
  // --- PGLite vs PostgreSQL ---
  // Allow explicit override: RUN_PG_MIGRATE=true forces PostgreSQL path (e.g. after db:reset)
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

  // --- Bootstrap for existing DBs ---
  // If __drizzle_migrations is missing but tables exist (e.g. DB created before migrations, or restored),
  // create the tracking table and mark first migration as applied so Drizzle doesn't re-create tables.
  let migrationsTableExists = false
  let allTablesExist = false

  try {
    const migrationsTableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '__drizzle_migrations')",
    )
    migrationsTableExists = migrationsTableCheck.rows[0]?.exists ?? false

    if (!migrationsTableExists) {
      // Tables that must exist to consider this a "seeded" DB (matches initial schema)
      const requiredTables = ['users', 'sessions', 'verification', 'account', 'wallet_identities']
      const tableCheckPromises = requiredTables.map(tableName =>
        pool.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
          [tableName],
        ),
      )
      const tableChecks = await Promise.all(tableCheckPromises)
      allTablesExist = tableChecks.every(result => result.rows[0]?.exists ?? false)

      if (allTablesExist) {
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
        await initMigrationsTrackingWhenTablesExist(pool, migrationsDir, migrationFiles)
      } else {
        logger.info({ context: 'migrate' }, 'Some tables are missing, running migrations...')
      }
    } else {
      logger.info({ context: 'migrate' }, 'Migrations tracking table exists, running migrations...')
    }
  } catch (checkError) {
    logger.error({ context: 'migrate', err: checkError }, 'Failed to check table existence')
    await pool.end()
    throw checkError
  }

  const db = drizzle(pool)

  // --- Run Drizzle migrations ---
  try {
    await migrate(db, { migrationsFolder: migrationsDir })
    logger.info({ context: 'migrate' }, 'Migrations completed successfully (PostgreSQL)')
  } catch (migrationError: unknown) {
    // Handle "table already exists": bootstrap race, or dev DB with manual schema
    const errorMessage =
      migrationError instanceof Error ? migrationError.message : String(migrationError)
    const isTableExistsError =
      errorMessage.includes('already exists') ||
      (errorMessage.includes('relation') && errorMessage.includes('already exists'))

    if (isTableExistsError && allTablesExist && !migrationsTableExists) {
      // This is expected - we just initialized migrations tracking but drizzle still tried to create tables
      // The migration is now tracked, so this is safe to ignore
      logger.info(
        { context: 'migrate' },
        'Migration error expected - tables exist and migration is now tracked. Migration state is consistent.',
      )
    } else if (isTableExistsError) {
      logger.warn(
        { context: 'migrate', err: migrationError },
        'Migration failed due to existing tables. Tables appear to match schema. For clean state, run: pnpm --filter @repo/api db:reset',
      )
      // In development/build, allow this to pass if tables exist and match schema
      // In production, this should fail to ensure proper migration tracking
      if (process.env.NODE_ENV === 'production') throw migrationError

      logger.info(
        { context: 'migrate' },
        'Allowing build to continue - tables exist and appear to match expected schema. Consider running db:reset for clean migration state.',
      )
    } else {
      logger.error({ context: 'migrate', err: migrationError }, 'Migration failed')
      throw migrationError
    }
  } finally {
    await pool.end()
  }

  process.exit(0)
} catch (err) {
  logger.error({ context: 'migrate', err }, 'Migration failed')
  process.exit(1)
}
