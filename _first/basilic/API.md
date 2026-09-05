# API First

## Principle

Define the capability and its boundary before consumers couple to an accidental implementation.

## Statement

I treat the capability and its boundary as a design decision, not an implementation leftover. Before a second consumer depends on a shape, I want to know what goes in, what comes out, what fails, which Security-owned authorization requirement applies, and how denial appears. That contract might be HTTP, a typed module, an event, a CLI, or an agent tool. The format matters less than making the boundary explicit on purpose.

## Outcome

Meaningful boundaries have explicit inputs, outputs, errors, and references to applicable authorization requirements. Implementations enforce those requirements and conform, or the contract is updated deliberately. Agent tools have the same explicitness as HTTP routes. A second consumer can be written without reading the handler.

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
- **Drift:** Architecture index “API as source of truth” vs routes/TypeBox generate OpenAPI. Follow TypeBox. ADR 009 already says Fastify routes are the source.
- **Unresolved:** public versioning/idempotency policy beyond regenerate-on-change; MCP server as a shipped app; GraphQL secondary interface (ADR 009 optional)

Who may call is Security. This station owns how credentials and denial appear on the contract.

## Minimum Useful Artifact

- capability: one Fastify route file + TypeBox schema
- inputs, outputs, stable identifiers in TypeBox (then generated OpenAPI)
- errors: catalog code; denial 401/403 as shipped
- authorization reference: public, JWT session, or API key — policy in SECURITY.md
- versioning: do not hand-edit OpenAPI; breaking change is a TypeBox change plus generate
- contract check: generate + `git diff --exit-code`

## Recipe

1. Inspect `apps/api/src/routes/`, TypeBox, OpenAPI, `@repo/core`, `@repo/react`, CLI, error catalog, tests.
2. Understand capabilities and consumers (web, CLI, not mobile).
3. Identify undocumented boundaries, spec/implementation drift, inconsistent errors.
4. Propose the smallest useful contract change. Keep intentional existing decisions.
5. Make inputs, outputs, errors, and denial explicit in TypeBox. Point at Security for who may invoke.
6. Implement against the contract. Do not let the handler invent a parallel shape. Do not edit `openapi.json`.
7. Validate with generate + drift check and API Vitest (`fastify.inject()`).
8. Update generated OpenAPI and `@repo/core` in the same work; handwritten `@repo/react` hooks when the UI needs them.

## Validation

- A second consumer can be written against OpenAPI / `@repo/core` without reading the handler.
- Request and response shapes match TypeBox → OpenAPI, or the discrepancy is named.
- Errors follow the catalog, not a dialect per endpoint.
- Authorization is referenced and enforced at Fastify, not redefined as comments. Policy lives in Security.
- CLI has name, inputs, outputs, and failure behavior (`packages/cli`).
- Breaking changes are visible before merge (drift job).

## Definition of Done

Contracts are documented (TypeBox + generated OpenAPI) and implementations conform, or discrepancies are named. Breaking changes are identified before merge.

## Agent Prompt

Apply API First to Basilic.

Read architecture/api MDX, ADR 009, OpenAPI generation docs, TypeBox routes, `apps/api/openapi/openapi.json`, `@repo/core`, `@repo/react`, error catalog, CLI, and tests. Do not assume a hand-edited spec is correct.

Source of truth is TypeBox on the route. OpenAPI and `@repo/core` are generated. Do not define a new authorization policy here. Do not widen into a public platform or GraphQL unless the product already is that.

Propose the smallest useful boundary: one operation made explicit in TypeBox. Implement against the contract. Validate with generate + drift check and API tests. When behavior changes, regenerate OpenAPI and `@repo/core` in the same work. Update this instance when paths or checks change.

## Notes

**API vs Product:** Product names the capability and why it exists. API names how systems ask for it.

**API vs Architecture:** Architecture decides which parts communicate. API defines the contract across that boundary.

**API vs Data:** Data owns canonical domain meaning. API owns the consumer-facing representation.

**API vs Security:** Security owns who may invoke a capability. API owns how that requirement, credentials, and denial appear at the boundary.

**API vs Documentation:** TypeBox/OpenAPI is the contract. MDX explains why it looks that way.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/API.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/API.md) · [Factory map](../ABOUT.md) · [API architecture](../../apps/docu/content/docs/architecture/api.mdx) · [OpenAPI generation](../../apps/docu/content/docs/development/openapi-generation.mdx)
