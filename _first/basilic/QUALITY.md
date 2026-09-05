# Quality First

## Principle

See /f-quality.

## Artifacts

- **Fact:** [testing/index.mdx](../../apps/docu/content/docs/testing/index.mdx), [product-ready.mdx](../../apps/docu/content/docs/testing/product-ready.mdx), [e2e-testing.mdx](../../apps/docu/content/docs/testing/e2e-testing.mdx)
- **Fact:** API: Vitest + `fastify.inject()`, group `*.spec.ts` imports `*.test.ts`, PGLite, serial workers, orphan import check
- **Fact:** Packages: Vitest for `core`, `react`, `error`
- **Fact:** Web: Playwright only (no frontend unit suite). Maestro deferred in CI.
- **Fact:** One HTTP status per `inject()`; catalog `{ code, message }`; `BAD_REQUEST` on schema 400
- **Fact:** AI: contract tests hard; remote may `ctx.skip()` when key missing or 402 — never return early without skip (soft-pass forbidden). With real key, 502/503/504 fail.
- **Fact:** Coverage: `pnpm --filter @repo/api test:cov` uploaded; **no floors** in CI
- **Fact:** Playbooks: `write-api-test`, `write-unit-tests`, `use-tdd`, `run-all-tests-and-fix`
- **Fact:** Product Ready (R0 bar) is the fork-and-run checklist on [product-ready.mdx](../../apps/docu/content/docs/testing/product-ready.mdx), not CI green. Workflow runs CI.
- **Fact:** `/use-frontend` rendered verification is bounded screenshots and keyboard, not visual-regression CI
- **Unresolved:** eval datasets for `/ai/chat` and `/ai/generate`; performance budgets; visual regression

## Minimum Useful Artifact

- risk: auth, health, catalog errors, OpenAPI drift
- criterion: API test or Playwright spec asserting behavior; adopter bar is [product-ready.mdx](../../apps/docu/content/docs/testing/product-ready.mdx)
- eval/budget: **unresolved** for probabilistic AI and perf
- command: `pnpm --filter @repo/api test:unit`, `pnpm test:e2e`
- on fail: fix or escalate; do not skip remote AI without `ctx.skip()`

## Notes

Quality defines what should be validated. Workflow runs the validation. Product defines success after use. For `/ai/*`, do not treat a wrapper unit test as an eval. Never soft-pass remote AI tests.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/QUALITY.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/QUALITY.md) · [Factory map](../ABOUT.md) · [Testing](../../apps/docu/content/docs/testing/index.mdx)
