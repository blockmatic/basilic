#!/usr/bin/env node
import 'dotenv/config'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../src/lib/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

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

  // Check if users table already exists (indicates migrations were run manually)
  try {
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')",
    )
    const usersTableExists = tableCheck.rows[0]?.exists ?? false

    if (usersTableExists) {
      // Check if migrations table exists
      const migrationsTableCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '__drizzle_migrations')",
      )
      const migrationsTableExists = migrationsTableCheck.rows[0]?.exists ?? false

      if (!migrationsTableExists) {
        logger.info(
          { context: 'migrate' },
          'Users table exists but migrations tracking not initialized. Tables appear to be already migrated. Skipping migration step.',
        )
        await pool.end()
        process.exit(0)
      } else {
        // Migrations table exists, let drizzle handle it normally
        logger.info(
          { context: 'migrate' },
          'Migrations tracking table exists, running migrations...',
        )
      }
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
    // If migration fails with table exists error and we got here, it's a real conflict
    logger.error({ context: 'migrate', err: migrationError }, 'Migration failed')
    throw migrationError
  } finally {
    await pool.end()
  }

  process.exit(0)
} catch (err) {
  logger.error({ context: 'migrate', err }, 'Migration failed')
  process.exit(1)
}
