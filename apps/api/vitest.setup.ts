/**
 * Vitest per-file setup. Database lifecycle is owned by each group entry `.spec.ts`
 * via `test/utils/db-setup.ts` (truncate between groups; PGLite stays open per worker).
 *
 * Remote AI tests run only when ANTHROPIC_API_KEY is a real secret (`hasRealAnthropicKey`).
 */

process.env.AI_PROVIDER = 'anthropic'
process.env.AI_DEFAULT_MODEL = 'claude-haiku-4-5'
Reflect.deleteProperty(process.env, 'OPEN_ROUTER_API_KEY')
Reflect.deleteProperty(process.env, 'OLLAMA_BASE_URL')
