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
 * Chat tests call real AI API. AI tests use Ollama at ollama.gaboesquivel.com by default.
 * Overrides are applied here so tests never hit localhost or OpenRouter.
 * Tests use the default model only; do not set AI_DEFAULT_MODEL.
 * When OpenRouter returns 402 (insufficient credits), tests warn and pass without full validation.
 * When the AI provider is unreachable (5xx, ECONNREFUSED, etc.), tests skip with clear message.
 */

// Enforce Ollama at ollama.gaboesquivel.com for AI tests (overrides .env.test)
process.env.OLLAMA_BASE_URL = 'https://ollama.gaboesquivel.com'
process.env.AI_PROVIDER = 'ollama'
Reflect.deleteProperty(process.env, 'OPEN_ROUTER_API_KEY')
