import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
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
    counter: integer('counter').notNull(),
    name: text('name').notNull(),
    transports: jsonb('transports').$type<string[]>(),
    credentialDeviceType: text('credential_device_type'),
    credentialBackedUp: boolean('credential_backed_up'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [index('passkey_credentials_user_id_idx').on(table.userId)],
)

export type PasskeyCredential = typeof passkeyCredentials.$inferSelect
export type NewPasskeyCredential = typeof passkeyCredentials.$inferInsert
