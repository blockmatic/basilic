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
 * Chat tests call real AI API. Use OLLAMA_BASE_URL in .env.test (or CI env).
 * Overrides here: AI_PROVIDER=ollama, OPEN_ROUTER_API_KEY unset (tests use Ollama only).
 * Tests use the default model only; do not set AI_DEFAULT_MODEL.
 * When OpenRouter returns 402 (insufficient credits), tests warn and pass without full validation.
 * When the AI provider is unreachable (5xx, ECONNREFUSED, etc.), tests pass gracefully via
 * skipIfProviderUnavailable. Use OLLAMA_BASE_URL in .env.test or CI env.
 */

// Enforce Ollama for AI tests (OLLAMA_BASE_URL from .env.test or CI env)
process.env.AI_PROVIDER = 'ollama'
Reflect.deleteProperty(process.env, 'OPEN_ROUTER_API_KEY')
