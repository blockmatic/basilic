import { describe, expect, it } from 'vitest'
import {
  closeTestDatabase,
  getTestDatabase,
  resetTestDatabase,
  setupTestDatabase,
  TEST_DATABASE_URL,
} from './db.js'

describe('PGLite Test Database Utilities', () => {
  it('should initialize PGLite instance', async () => {
    const { instance, url } = await getTestDatabase()
    expect(instance).toBeDefined()
    expect(url).toBe(TEST_DATABASE_URL)
  })

  it('should return same instance on multiple calls (singleton)', async () => {
    const { instance: instance1 } = await getTestDatabase()
    const { instance: instance2 } = await getTestDatabase()
    expect(instance1).toBe(instance2)
  })

  it('should close database instance', async () => {
    await getTestDatabase()
    await closeTestDatabase()
    // After closing, new instance should be created
    const { instance: newInstance } = await getTestDatabase()
    expect(newInstance).toBeDefined()
  })

  it('should setup test database', async () => {
    const instance = await setupTestDatabase()
    expect(instance).toBeDefined()
  })

  it('should reset test database', async () => {
    await getTestDatabase()
    const { instance } = await resetTestDatabase()
    expect(instance).toBeDefined()
  })
})

describe('Database Connection', () => {
  it('should connect to database', async () => {
    const { instance } = await getTestDatabase()
    await instance.waitReady
    expect(instance).toBeDefined()
  })

  it('should execute SQL queries', async () => {
    const { instance } = await getTestDatabase()
    await instance.waitReady

    // Create a test table
    await instance.exec(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `)

    // Insert data
    await instance.exec(`
      INSERT INTO test_table (name) VALUES ('test')
    `)

    // Query data
    const result = await instance.query('SELECT * FROM test_table')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('test')
  })
})
