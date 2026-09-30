/**
 * Vitest per-file setup. Database lifecycle is owned by each group entry `.spec.ts`
 * via `test/utils/db-setup.ts` (truncate between groups; PGLite stays open per worker).
 *
 * Remote AI / Jev tests run only when RUN_JEV_TESTS=1 and AI_GATEWAY_API_KEY is a real secret.
 */

await import("./src/lib/markets-host.js");
