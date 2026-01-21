#!/usr/bin/env node
import 'dotenv/config'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../src/lib/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const logger = {
  info: (msg: string) => console.log(`[migrate] ${msg}`),
  error: (msg: string, err?: unknown) => {
    console.error(`[migrate] ERROR: ${msg}`)
    if (err) console.error(err)
  },
}

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
    logger.info('PGLite detected: migrations will run at runtime when instance is created')
    process.exit(0)
  }

  // PostgreSQL: Run migrations at build time
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when PGLITE is false')
  }

  const migrationsDir = join(projectRoot, 'src', 'db', 'migrations')
  const migrationFiles = await readMigrationFiles()

  if (migrationFiles.length === 0) {
    logger.info('No migrations found, skipping migration step')
    process.exit(0)
  }

  logger.info(`Found ${migrationFiles.length} migration file(s), running migrations...`)

  const pool = new Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(pool)

  try {
    await migrate(db as unknown as NodePgDatabase, { migrationsFolder: migrationsDir })
    logger.info('Migrations completed successfully (PostgreSQL)')
  } finally {
    await pool.end()
  }

  process.exit(0)
} catch (err) {
  logger.error('Migration failed', err)
  process.exit(1)
}
