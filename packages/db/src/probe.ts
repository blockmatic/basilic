import { sql } from "drizzle-orm";

import { getDb } from "./client.js";

export async function probeDatabase(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
