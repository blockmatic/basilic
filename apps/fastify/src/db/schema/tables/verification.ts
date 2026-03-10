import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const verificationTypes = [
  'magic_link',
  'link_email',
  'oauth_state',
  'change_email',
  'oauth_link_state',
] as const
export type VerificationType = (typeof verificationTypes)[number]

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    type: text('type', { enum: verificationTypes }).default('magic_link').notNull(),
    identifier: text('identifier').notNull(), // Email for magic_link/link_email; chain:address for wallet nonce
    value: text('value').notNull(), // Token hash or nonce
    tokenPlain: text('token_plain'), // Plain token for @test.ai when ALLOW_TEST (DB-backed, no fake outbox)
    expiresAt: timestamp('expires_at').notNull(),
    meta: jsonb('meta').$type<{ codeVerifier?: string; userId?: string }>(),
    consumedAt: timestamp('consumed_at'),
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
