#!/usr/bin/env node
/**
 * Data seed after a local Supabase reset. Invoked only from `pnpm reset` (apps/api or repo root via filter).
 * (not from `pnpm db:migrate` / `pnpm build`).
 *
 * Add idempotent inserts here (`onConflictDoNothing()` / upserts). Uses the same
 * PostgreSQL vs PGLite rules as `scripts/migrate.ts` (`RUN_PG_MIGRATE`, `DATABASE_URL`).
 */
import 'dotenv/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger/server'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../src/db/schema/index.js'
import { env } from '../src/lib/env.js'

const scriptFile = fileURLToPath(import.meta.url)

async function applySeed(_db: NodePgDatabase<typeof schema>): Promise<void> {
  // Reference / dev rows only — extend with db.insert(...).onConflictDoNothing(), etc.
}

export async function runSeed(): Promise<void> {
  const forcePg = process.env.RUN_PG_MIGRATE === 'true'
  const shouldUsePGLite = !forcePg && (env.PGLITE === true || env.NODE_ENV === 'test')

  if (shouldUsePGLite) {
    logger.info({ context: 'seed' }, 'PGLite: skipping data seed')
    return
  }

  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required when PGLITE is false')

  const pool = new Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(pool, { schema })
  try {
    await applySeed(db)
    logger.info({ context: 'seed' }, 'Seed completed')
  } finally {
    await pool.end()
  }
}

function isMainModule(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  return resolve(entry) === scriptFile
}

async function main(): Promise<void> {
  try {
    await runSeed()
    process.exit(0)
  } catch (err) {
    logger.error({ context: 'seed', err }, 'Seed failed')
    process.exit(1)
  }
}

if (isMainModule()) void main()
