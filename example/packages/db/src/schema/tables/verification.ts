import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const verificationTypes = [
  "magic_link",
  "link_email",
  "oauth_state",
  "change_email",
  "oauth_link_state",
  "session_revoke",
] as const;
export type VerificationType = (typeof verificationTypes)[number];

export const verification = pgTable(
  "verification",
  {
    consumedAt: timestamp("consumed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(), // Email for magic_link/link_email; chain:address for wallet nonce
    meta: jsonb("meta").$type<{
      codeVerifier?: string;
      userId?: string;
      redirectUri?: string;
      sessionId?: string;
    }>(),
    tokenPlain: text("token_plain"), // Plain token for @test.ai when ALLOW_TEST (DB-backed, no fake outbox)
    type: text("type", { enum: verificationTypes })
      .default("magic_link")
      .notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    value: text("value").notNull(), // Token hash or nonce,
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
  ]
);

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
