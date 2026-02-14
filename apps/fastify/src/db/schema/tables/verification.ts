import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(), // Email for magic links
    value: text('value').notNull(), // Token hash
    tokenPlain: text('token_plain'), // Plain token for @test.ai when ALLOW_TEST (DB-backed, no fake outbox)
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('verification_identifier_idx').on(table.identifier),
    index('verification_expires_at_idx').on(table.expiresAt),
  ],
)

export type Verification = typeof verification.$inferSelect
export type NewVerification = typeof verification.$inferInsert
