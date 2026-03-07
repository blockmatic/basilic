import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const passkeyCredentials = pgTable(
  'passkey_credentials',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    credentialId: text('credential_id').notNull().unique(),
    publicKey: text('public_key').notNull(),
    counter: text('counter').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('passkey_credentials_user_id_idx').on(table.userId),
    index('passkey_credentials_credential_id_idx').on(table.credentialId),
  ],
)

export type PasskeyCredential = typeof passkeyCredentials.$inferSelect
export type NewPasskeyCredential = typeof passkeyCredentials.$inferInsert
