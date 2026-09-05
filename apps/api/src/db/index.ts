import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import { env } from '../lib/env.js'
import * as schema from './schema/index.js'

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePGLite> | null = null
let pgLiteInstance: PGlite | null = null
let pgPool: Pool | null = null

function shouldUsePGLite(): boolean {
  if (env.PGLITE === true) return true
  if (env.NODE_ENV === 'test') return true
  return false
}

export async function getDb() {
  const testOverride = (globalThis as { __basilicGetDb?: () => ReturnType<typeof loadDb> })
    .__basilicGetDb
  if (testOverride) return testOverride()
  return loadDb()
}

async function loadDb() {
  if (!db)
    if (shouldUsePGLite()) {
      if (env.NODE_ENV === 'test') {
        const g = globalThis as { __testPgliteInstance?: PGlite }
        const instance = g.__testPgliteInstance
          ? g.__testPgliteInstance
          : (await import('../../test/utils/db.js')).getTestDatabase().then(x => x.instance)
        const pglite = instance instanceof PGlite ? instance : await instance
        db = drizzlePGLite(pglite, { schema })
      } else {
        if (!pgLiteInstance) {
          pgLiteInstance = new PGlite()
          await pgLiteInstance.waitReady
        }
        db = drizzlePGLite(pgLiteInstance, { schema })
      }
    } else {
      if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required when PGLITE is false')

      if (!pgPool) pgPool = new Pool({ connectionString: env.DATABASE_URL })
      db = drizzle(pgPool, { schema })
    }

  return db
}

/**
 * Check if database is ready (initialized)
 */
export function isDbReady(): boolean {
  return db !== null
}

/**
 * Reset the database instance cache.
 * Used in tests to ensure a fresh database connection after resetting the underlying database.
 */
export function resetDbInstance() {
  db = null
  // Note: pgLiteInstance is managed by test utils, don't reset it here
}

export async function closeDb() {
  if (pgPool) {
    await pgPool.end()
    pgPool = null
  }
  db = null
}
