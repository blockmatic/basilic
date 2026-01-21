import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getDb } from '../src/db/index.js'
import { users } from '../src/db/schema/index.js'

describe('Database Integration', () => {
  it('should initialize database client in test environment', async () => {
    const db = await getDb()
    expect(db).toBeDefined()
  })

  it('should use PGLite in test environment', async () => {
    // Verify NODE_ENV is test
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.DATABASE_URL).toBe('postgresql://localhost/test')

    const db = await getDb()
    expect(db).toBeDefined()
  })

  it('should return same database instance on multiple calls', async () => {
    const db1 = await getDb()
    const db2 = await getDb()
    expect(db1).toBe(db2)
  })

  it('should perform database operations', async () => {
    const db = await getDb()

    // Test insert
    const [newUser] = await db
      .insert(users)
      .values({
        id: 'test-user-1',
        email: 'test@example.com',
      })
      .returning()

    expect(newUser).toBeDefined()
    expect(newUser.id).toBe('test-user-1')
    expect(newUser.email).toBe('test@example.com')

    // Test select
    const [user] = await db.select().from(users).where(eq(users.id, 'test-user-1')).limit(1)

    expect(user).toBeDefined()
    expect(user?.email).toBe('test@example.com')

    // Cleanup
    await db.delete(users).where(eq(users.id, 'test-user-1'))
  })
})
