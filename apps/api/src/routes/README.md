# Routes

One Fastify plugin file per endpoint. Folder layout mirrors the URL path (e.g. `routes/auth/magiclink/request.ts` → `POST /auth/magiclink/request`). See [API architecture](/docs/architecture/api) and [ADR 009](/docs/adrs/009-api-architecture).

## Conventions

- Collocate TypeBox schemas with the route handler in the same file.
- Group tests: `routes/{domain}/{group}.spec.ts` owns Fastify + DB lifecycle; `*.test.ts` files are imported by the spec entry.
- Shared logic belongs in `lib/`, not under `routes/`.
- Do not add `index.ts` barrels under `routes/` — Fastify autoload treats them as plugins.

## Schema

Use TypeBox for request/response schemas. Fastify validates automatically; handlers stay thin.

```typescript
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { isDbReady } from '../db/index.js'

const HealthResponseSchema = Type.Object({
  ok: Type.Boolean(),
  dbReady: Type.Boolean(),
})

const healthRoute: FastifyPluginAsync = async fastify => {
  fastify.get('/health', {
    schema: { response: { 200: HealthResponseSchema } },
  }, async () => ({ ok: true, dbReady: isDbReady() }))
}

export default healthRoute
```

## Related

- [Error handling](/docs/architecture/error-handling) — `sendCatalogError` for catalog responses
- [OpenAPI generation](/docs/development/openapi-generation) — run `pnpm generate` after schema changes
