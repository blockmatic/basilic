/** Schema + migrations for `@repo/db`. Local Docker Postgres is `pnpm db:start`. Identity seed stays in `apps/api`. */
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error("POSTGRES_URL environment variable is required");
}

export default defineConfig({
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: "postgresql",
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
  out: "./src/migrations",
  schema: "./src/schema/tables/*.ts",
  strict: true,
  verbose: true,
});
