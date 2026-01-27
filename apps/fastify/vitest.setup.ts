/**
 * Vitest Test Setup
 *
 * Runs before each test file in each worker.
 * Provides global setup for tests.
 *
 * ## Database Lifecycle
 *
 * Database lifecycle is now managed by each group entry `.spec.ts` file.
 * See `test/utils/db-setup.ts` for the DB setup utility.
 *
 * ## Important Notes
 *
 * - React is set up globally by @repo/email/render when React Email components are imported
 * - DB lifecycle moved to group entry files per testing strategy rules
 * - Each group entry file owns its Fastify + DB lifecycle
 */
