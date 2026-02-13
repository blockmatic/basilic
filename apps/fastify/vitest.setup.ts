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
 * ## AI Tests
 *
 * Chat tests call real Open Router API. Requires OPEN_ROUTER_API_KEY in .env.test.
 */
