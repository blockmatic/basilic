/**
 * Vitest Test Setup
 *
 * Runs before each test file in each worker.
 * Provides global setup for tests.
 *
 * Database lifecycle is managed by each group entry `.spec.ts` file via `test/utils/db-setup.ts`.
 *
 * ## AI Tests
 *
 * Chat tests call a real AI API. Use ANTHROPIC_API_KEY in .env.test or CI secrets.
 * Overrides here: AI_PROVIDER=anthropic, AI_DEFAULT_MODEL=claude-haiku-4-5, Ollama/OpenRouter unset.
 * When the AI provider is unreachable (5xx, ECONNREFUSED, etc.), tests pass gracefully via
 * skipIfProviderUnavailable. Set ANTHROPIC_API_KEY in .env.test or GitHub secrets for CI.
 */

// Enforce Anthropic for AI tests (ANTHROPIC_API_KEY from .env.test or CI env)
process.env.AI_PROVIDER = 'anthropic'
process.env.AI_DEFAULT_MODEL = 'claude-haiku-4-5'
Reflect.deleteProperty(process.env, 'OPEN_ROUTER_API_KEY')
Reflect.deleteProperty(process.env, 'OLLAMA_BASE_URL')
