import { drizzle } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import { getTestDatabase } from '../../test/utils/db.js'
import { env } from '../lib/env.js'
import * as schema from './schema/index.js'

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePGLite> | null = null

function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || env.DATABASE_URL === 'postgresql://localhost/test'
}

export async function getDb() {
  if (!db) {
    if (isTestEnvironment()) {
      // Use PGLite for tests
      const { instance } = await getTestDatabase()
      db = drizzlePGLite(instance, { schema })
    } else {
      // Use PostgreSQL for dev/prod
      const pool = new Pool({ connectionString: env.DATABASE_URL })
      db = drizzle(pool, { schema })
    }
  }
  return db
}
