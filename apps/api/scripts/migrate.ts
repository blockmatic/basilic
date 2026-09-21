#!/usr/bin/env node
/**
 * Build-time / CLI PostgreSQL migrator.
 * PGLite skips here (runtime `runMigrations`). Preview skips unless RUN_PG_MIGRATE=true.
 * Local `pnpm dev` applies Postgres via `@repo/db` `runMigrations` on boot.
 */
import 'dotenv/config'
import { migrationsDir, runPostgresMigrations } from '@repo/db/migrate'
import { logger } from '@repo/utils/logger/server'
import { Pool } from 'pg'
import { env } from '../src/lib/env.js'

const migrateLogger = {
  info: (msg: string) => logger.info({ context: 'migrate' }, msg),
  error: (msg: string, err?: unknown) => logger.error({ context: 'migrate', err }, msg),
  warn: (msg: string, err?: unknown) => logger.warn({ context: 'migrate', err }, msg),
}

try {
  const forcePg = process.env.RUN_PG_MIGRATE === 'true'
  const shouldUsePGLite = !forcePg && (env.PGLITE === true || env.NODE_ENV === 'test')

  if (shouldUsePGLite) {
    logger.info(
      { context: 'migrate' },
      'PGLite detected: migrations will run at runtime when instance is created',
    )
    process.exit(0)
  }

  if (process.env.VERCEL_ENV === 'preview' && !forcePg) {
    logger.info(
      { context: 'migrate', vercelEnv: 'preview' },
      'Skipping PostgreSQL migrations on Vercel Preview. Set RUN_PG_MIGRATE=true with an isolated DATABASE_URL to apply Preview migrations.',
    )
    process.exit(0)
  }

  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required when PGLITE is false')

  const pool = new Pool({ connectionString: env.DATABASE_URL })
  try {
    await runPostgresMigrations({
      pool,
      migrationsDir,
      logger: migrateLogger,
      nodeEnv: env.NODE_ENV,
    })
  } finally {
    await pool.end()
  }

  process.exit(0)
} catch (err) {
  logger.error({ context: 'migrate', err }, 'Migration failed')
  process.exit(1)
}
