import { configureDb } from "@repo/db";
import { runMigrations } from "@repo/db/migrate";
import { logger } from "@repo/utils/logger/server";

import { env } from "./env.js";

type HostGlobal = typeof globalThis & { __basilicEveHostBoot?: Promise<void> };

export function isEveHostBuild() {
  return Boolean(env.EVE_INTERNAL_HOST_BUILD_OUTPUT_DIRECTORY);
}

export async function bootHost(): Promise<void> {
  const g = globalThis as HostGlobal;
  g.__basilicEveHostBoot ??= startHost();
  return g.__basilicEveHostBoot;
}

async function startHost(): Promise<void> {
  if (isEveHostBuild()) return;

  configureDb({
    databaseUrl: env.POSTGRES_URL,
    pglite: env.PGLITE === true,
    vercel: Boolean(env.VERCEL_ENV),
  });
  await runMigrations({
    logger: {
      error: (msg, err) => logger.error({ err }, msg),
      info: (msg) => logger.info(msg),
    },
    nodeEnv: env.NODE_ENV,
    vercelEnv: env.VERCEL_ENV,
  });
}

await bootHost();
