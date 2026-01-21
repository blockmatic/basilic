import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import { getTestDatabase } from '../../test/utils/db.js'
import { env } from '../lib/env.js'
import * as schema from './schema/index.js'

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
