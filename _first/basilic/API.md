# API First

## Principle

See /f-api.

## Artifacts

- **Fact:** Contract source: TypeBox on Fastify routes in `apps/api/src/routes/` ([api.mdx](../../apps/docu/content/docs/architecture/api.mdx), [ADR 009](../../apps/docu/content/docs/adrs/009-api-architecture.mdx))
- **Fact:** Generated spec: [`../../apps/api/openapi/openapi.json`](../../apps/api/openapi/openapi.json) — do not edit by hand
- **Fact:** Generated client: `packages/core` via `pnpm generate`. Handwritten hooks: `packages/react`
- **Fact:** Tags: `auth`, `account`, `ai`, `health`. Catalog: `/reference` and `/reference/openapi.json`
- **Fact:** Consumers: `apps/web` (`@repo/core` + `@repo/react`); `packages/cli` (API key Bearer); other languages via OpenAPI. `apps/mobile` is not a consumer yet. `apps/docu` has no API.
- **Fact:** Errors: catalog `{ code, message }` via `sendCatalogError`. Real failures: `captureError` → Pino (`@repo/error/node`). Never leak stacks.
- **Fact:** `createClient` modes: no-auth, JWT (`getAuthToken` / refresh), apiKey (`bask_…`)
- **Fact:** Drift check: `pnpm generate && git diff --exit-code -- apps/api/openapi/openapi.json packages/core/src/gen` (also `api-e2e.yml`)
- **Fact:** Generation how-to: [openapi-generation.mdx](../../apps/docu/content/docs/development/openapi-generation.mdx)
- **Unresolved:** public versioning/idempotency policy beyond regenerate-on-change; MCP server as a shipped app; GraphQL secondary interface (ADR 009 optional)

Who may call is Security. This station owns how credentials and denial appear on the contract.

## Minimum Useful Artifact

- capability: one Fastify route file + TypeBox schema
- inputs, outputs, stable identifiers in TypeBox (then generated OpenAPI)
- errors: catalog code; denial 401/403 as shipped
- authorization reference: public, JWT session, or API key — policy in SECURITY.md
- versioning: do not hand-edit OpenAPI; breaking change is a TypeBox change plus generate
- contract check: generate + `git diff --exit-code`

## Notes

Product names the capability. Architecture decides which parts communicate. Data owns canonical domain meaning. Security owns who may invoke. Do not edit `openapi.json`. Do not widen into a public platform or GraphQL unless the product already is that.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/API.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/API.md) · [Factory map](../ABOUT.md) · [API](../../apps/docu/content/docs/architecture/api.mdx) · [ADR 009](../../apps/docu/content/docs/adrs/009-api-architecture.mdx)
