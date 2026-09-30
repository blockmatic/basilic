import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

const expectedTables = [
  "account",
  "api_keys",
  "auth_attempts",
  "passkey_auth_challenges",
  "passkey_callback",
  "passkey_challenges",
  "passkey_credentials",
  "sessions",
  "totp",
  "totp_setup",
  "users",
  "verification",
];

describe("0000_initial", () => {
  it("creates the auth tables and no coin or wallet tables", async () => {
    const db = new PGlite();
    const sql = readFileSync(
      join(import.meta.dirname, "migrations/0000_initial.sql"),
      "utf8"
    ).replaceAll(/--> statement-breakpoint\s*/gi, "\n");
    await db.exec(sql);
    const result = await db.query<{ tablename: string }>(
      "select tablename from pg_tables where schemaname = 'public'"
    );
    const names = result.rows.map((row) => row.tablename).sort();
    expect(names).toEqual([...expectedTables].sort());
    for (const absent of [
      "assets",
      "coin_watches",
      "wallet_identities",
      "web3_callback",
      "web3_nonce",
    ])
      expect(names).not.toContain(absent);
    await db.close();
  });
});
