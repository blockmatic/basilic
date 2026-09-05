import { sql } from 'drizzle-orm'
import { getDb } from './index.js'

export const dbHealth = {
  async probe() {
    const override = (globalThis as { __basilicDbReady?: boolean }).__basilicDbReady
    if (typeof override === 'boolean') return override
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
