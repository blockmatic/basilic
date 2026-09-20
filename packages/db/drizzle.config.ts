/** Schema + migrations for `@repo/db`. Local data seed stays in `apps/api` (`pnpm reset`). */
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required')

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/tables/*.ts',
  out: './src/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
})
