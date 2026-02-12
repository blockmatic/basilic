import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import * as schema from '@/db/schema/index.js'
import { env } from '@/lib/env.js'
import { getTestDatabase } from '../../test/utils/db.js'

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePGLite> | null = null
let pgLiteInstance: PGlite | null = null

function shouldUsePGLite(): boolean {
  if (env.PGLITE === true) return true
  if (env.NODE_ENV === 'test') return true
  return false
}

export async function getDb() {
  if (!db) {
    if (shouldUsePGLite()) {
      if (env.NODE_ENV === 'test') {
        const { instance } = await getTestDatabase()
        db = drizzlePGLite(instance, { schema })
      } else {
        if (!pgLiteInstance) {
          pgLiteInstance = new PGlite()
          await pgLiteInstance.waitReady
        }
        db = drizzlePGLite(pgLiteInstance, { schema })
      }
    } else {
      if (!env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required when PGLITE is false')
      }
      const pool = new Pool({ connectionString: env.DATABASE_URL })
      db = drizzle(pool, { schema })
    }
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
