import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { closeDb, configureDb, getDb } from "@repo/db";
import { runMigrations } from "@repo/db/migrate";
import { initErrorReporting } from "@repo/error/node";
import { logger } from "@repo/utils/logger/server";
import Fastify from "fastify";

import app from "./src/app.js";
import { waitForDatabase } from "./src/db/health.js";
import { env } from "./src/lib/env.js";
import { createApiLoggerOptions } from "./src/lib/http-logging.js";

if (env.NODE_ENV === "production" && env.ALLOW_TEST) {
  logger.error("ALLOW_TEST must not be true in production");
  process.exit(1);
}

initErrorReporting({
  dsn: env.SENTRY_DSN,
  environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
});

const fastify = Fastify({
  ...createApiLoggerOptions({ pretty: env.NODE_ENV === "development" }),
  bodyLimit: env.BODY_LIMIT,
  requestTimeout: env.REQUEST_TIMEOUT,
  trustProxy: env.TRUST_PROXY,
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.register(app);

/**
 * Initialize database and run migrations before starting server
 */
async function initialize(): Promise<void> {
  const logger = {
    error: (msg: string, err?: unknown) => fastify.log.error({ err }, msg),
    info: (msg: string) => fastify.log.info(msg),
  };

  try {
    configureDb({
      databaseUrl: env.POSTGRES_URL,
      pglite: env.PGLITE === true || env.NODE_ENV === "test",
      vercel: env.VERCEL,
    });

    // 1. Wait for database connection
    await waitForDatabase(logger);

    // 2. Initialize database connection (sets db for isDbReady())
    await getDb();

    // 3. Run migrations (PGLite always; Postgres in development)
    await runMigrations({ logger, nodeEnv: env.NODE_ENV });
  } catch (error) {
    fastify.log.error({ error }, "Initialization failed");
    throw error;
  }
}

const start = async () => {
  try {
    await fastify.listen({ host: env.HOST, port: env.PORT });
    fastify.log.info({ host: env.HOST, port: env.PORT }, "Server started");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    // Initialize database and migrations before starting server
    await initialize();

    await start();
  } catch {
    // Error already logged by initialize(), just exit
    process.exit(1);
  }
};

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  fastify.log.info(
    { signal },
    "Received shutdown signal, closing server gracefully"
  );

  try {
    // Close server with timeout
    await fastify.close();
    await closeDb();
    fastify.log.info("Server closed successfully");
    process.exit(0);
  } catch (error) {
    fastify.log.error({ error }, "Error during shutdown");
    process.exit(1);
  }
};

// Register signal handlers
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  fastify.log.error({ err }, "Uncaught exception");
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  fastify.log.error({ promise, reason }, "Unhandled rejection");
  shutdown("unhandledRejection");
});

startServer();
