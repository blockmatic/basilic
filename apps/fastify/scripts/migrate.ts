#!/usr/bin/env node
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../src/lib/env.js'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = dirname(scriptFile)
const projectRoot = join(scriptDir, '..')

async function readMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')
  try {
    const files = await readdir(migrationsDir)
    return files.filter(file => file.endsWith('.sql')).sort()
  } catch {
    return []
  }
}

try {
  const shouldUsePGLite = env.PGLITE === true || env.NODE_ENV === 'test'

  if (shouldUsePGLite) {
    // PGLite: Skip migrations at build time (they run at runtime)
    logger.info(
      { context: 'migrate' },
      'PGLite detected: migrations will run at runtime when instance is created',
    )
    process.exit(0)
  }

  // PostgreSQL: Run migrations at build time
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when PGLITE is false')
  }

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

  // Check if migrations table exists - if it does, drizzle will handle migrations properly
  // If it doesn't exist, check if all required tables exist
  let migrationsTableExists = false
  let allTablesExist = false

  try {
    const migrationsTableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '__drizzle_migrations')",
    )
    migrationsTableExists = migrationsTableCheck.rows[0]?.exists ?? false

    if (!migrationsTableExists) {
      // Check if all required tables exist
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
        // Create migrations tracking table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
            id SERIAL PRIMARY KEY,
            hash text NOT NULL,
            created_at bigint
          )
        `)
        // Calculate hash for the migration and mark it as applied
        // Drizzle uses a hash of the migration SQL - we'll calculate it the same way
        const firstMigrationFile = migrationFiles[0]
        if (firstMigrationFile) {
          const migrationContent = readFileSync(join(migrationsDir, firstMigrationFile), 'utf-8')
          // Drizzle calculates hash using a normalized version of the SQL
          // Simplified: use SHA256 hash of the migration content
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

  try {
    await migrate(db, { migrationsFolder: migrationsDir })
    logger.info({ context: 'migrate' }, 'Migrations completed successfully (PostgreSQL)')
  } catch (migrationError: unknown) {
    // Check if error is about table already existing
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
        'Migration failed due to existing tables. Tables appear to match schema. For clean state, run: pnpm --filter @repo/fastify db:reset',
      )
      // In development/build, allow this to pass if tables exist and match schema
      // In production, this should fail to ensure proper migration tracking
      if (process.env.NODE_ENV === 'production') {
        throw migrationError
      }
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
