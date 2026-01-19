// Set DATABASE_URL before env validation
// This must happen before any imports that use env.ts
process.env.DATABASE_URL = 'postgresql://localhost/test'
process.env.NODE_ENV = 'test'

import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate as migratePGLite } from 'drizzle-orm/pglite/migrator'
import { afterAll, beforeAll } from 'vitest'
import { getDb } from './src/db/index.js'
import { closeTestDatabase, getTestDatabase } from './test/utils/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

beforeAll(async () => {
  await getTestDatabase()
  const db = await getDb()

  // Try to run migrations if they exist
  const migrationsDir = join(__dirname, '..', 'src', 'db', 'migrations')
  try {
    const files = await readdir(migrationsDir)
    const sqlFiles = files.filter(file => file.endsWith('.sql'))
    if (sqlFiles.length > 0) {
      await migratePGLite(db as Parameters<typeof migratePGLite>[0], {
        migrationsFolder: migrationsDir,
      })
      return
    }
  } catch {
    // Migrations directory doesn't exist, continue to manual setup
  }

  // Fallback: Create tables manually using SQL
  // This is a temporary solution until migrations are generated
  const { instance } = await getTestDatabase()
  await instance.exec(`
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
  `)
})

afterAll(async () => {
  await closeTestDatabase()
})
