import { sql } from 'drizzle-orm'
import { getDb } from './index.js'

export const dbHealth = {
  async probe(): Promise<boolean> {
    try {
      const db = await getDb()
      await db.execute(sql`select 1`)
      return true
    } catch {
      return false
    }
  },
}

export async function probeDb(): Promise<boolean> {
  return dbHealth.probe()
}
