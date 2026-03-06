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
 * Chat tests call real AI API. Requires OLLAMA_BASE_URL or OPEN_ROUTER_API_KEY in .env.test.
 * Tests use the default model only; do not set AI_DEFAULT_MODEL.
 * When OpenRouter returns 402 (insufficient credits), tests warn and pass without full validation.
 */
