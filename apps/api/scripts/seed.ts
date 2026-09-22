#!/usr/bin/env node
/**
 * Data seed after a local wipe. Invoked from `pnpm reset` and Fastify boot (`seedIdentityIfEmpty`).
 * Not from `pnpm db:migrate` / `pnpm build` alone.
 *
 * Add idempotent inserts here (`onConflictDoNothing()` / upserts). Skips when PGLite
 * or `NODE_ENV=test` (same gate as migrate, without Vercel Preview skip).
 */
import 'dotenv/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as schema from '@repo/db/schema'
import { logger } from '@repo/utils/logger/server'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { seedIdentity } from '../src/lib/coins/index.js'
import { env } from '../src/lib/env.js'

const scriptFile = fileURLToPath(import.meta.url)

async function applySeed(db: NodePgDatabase<typeof schema>): Promise<void> {
  await seedIdentity({ db })
}

export async function runSeed(): Promise<void> {
  const forcePg = process.env.RUN_PG_MIGRATE === 'true'
  const shouldUsePGLite = !forcePg && (env.PGLITE === true || env.NODE_ENV === 'test')

  if (shouldUsePGLite) {
    logger.info({ context: 'seed' }, 'PGLite: skipping data seed')
    return
  }

  if (!env.POSTGRES_URL) throw new Error('POSTGRES_URL is required when PGLITE is false')

  const pool = new Pool({ connectionString: env.POSTGRES_URL })
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
