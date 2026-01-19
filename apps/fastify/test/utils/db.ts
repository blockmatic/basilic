import { PGlite } from '@electric-sql/pglite'

// Singleton pattern for test database
let pgLiteInstance: PGlite | null = null
let dbUrl: string | null = null

export const TEST_DATABASE_URL = 'postgresql://localhost/test'

export async function getTestDatabase() {
  if (!pgLiteInstance) {
    pgLiteInstance = new PGlite()
    await pgLiteInstance.waitReady
    // Generate connection string compatible with PostgreSQL clients
    dbUrl = TEST_DATABASE_URL
  }
  return { instance: pgLiteInstance, url: dbUrl ?? TEST_DATABASE_URL }
}

export async function closeTestDatabase() {
  if (pgLiteInstance) {
    await pgLiteInstance.close()
    pgLiteInstance = null
    dbUrl = null
  }
}

export async function setupTestDatabase() {
  const { instance } = await getTestDatabase()
  return instance
}

export async function resetTestDatabase() {
  if (pgLiteInstance) {
    // Close and recreate for fresh database
    await closeTestDatabase()
    return await getTestDatabase()
  }
  return await getTestDatabase()
}
