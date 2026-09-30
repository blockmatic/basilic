/**
 * Vitest per-file setup. Database lifecycle is owned by each group entry `.spec.ts`
 * via `test/utils/db-setup.ts` (truncate between groups; PGLite stays open per worker).
 *
 * Remote AI tests run only when AI_GATEWAY_API_KEY is a real secret (`hasRealGatewayKey`).
 */

await import("./src/lib/markets-host.js");
