# Quality First

## Principle

Name what good means — acceptance, tests, evals, performance — before anyone optimizes toward an undefined target.

## Statement

I do not ask anyone to "make it better" without saying what better means. Tests prove deterministic behavior. Evals cover probabilistic output. Performance budgets beat vibes. Name the bar before you optimize, or you ship something that looks done and still fails users.

## Outcome

Acceptance criteria exist for features that matter. Tests protect critical paths. AI features with probabilistic output have evals where appropriate. Performance-sensitive areas have budgets. Humans and agents know what done means beyond "it compiles."

## Artifacts

- **Fact:** [testing/index.mdx](../../apps/docu/content/docs/testing/index.mdx), [product-ready.mdx](../../apps/docu/content/docs/testing/product-ready.mdx), [e2e-testing.mdx](../../apps/docu/content/docs/testing/e2e-testing.mdx)
- **Fact:** API: Vitest + `fastify.inject()`, group `*.spec.ts` imports `*.test.ts`, PGLite, serial workers, orphan import check
- **Fact:** Packages: Vitest for `core`, `react`, `error`
- **Fact:** Web: Playwright only (no frontend unit suite). Maestro deferred in CI.
- **Fact:** One HTTP status per `inject()`; catalog `{ code, message }`; `BAD_REQUEST` on schema 400
- **Fact:** AI: contract tests hard; remote may `ctx.skip()` when key missing or 402 — never return early without skip (soft-pass forbidden). With real key, 502/503/504 fail.
- **Fact:** Coverage: `pnpm --filter @repo/api test:cov` uploaded; **no floors** in CI
- **Fact:** Playbooks: `write-api-test`, `write-unit-tests`, `use-tdd`, `run-all-tests-and-fix`
- **Fact:** Product Ready (R0 bar) is the fork-and-run checklist on [product-ready.mdx](../../apps/docu/content/docs/testing/product-ready.mdx), not CI green. Pipelines run CI.
- **Unresolved:** eval datasets for `/ai/chat` and `/ai/generate`; performance budgets; visual regression

## Minimum Useful Artifact

- risk: auth, health, catalog errors, OpenAPI drift
- criterion: API test or Playwright spec asserting behavior; adopter bar is [product-ready.mdx](../../apps/docu/content/docs/testing/product-ready.mdx)
- eval/budget: **unresolved** for probabilistic AI and perf
- command: `pnpm --filter @repo/api test:unit`, `pnpm test:e2e`
- on fail: fix or escalate; do not skip remote AI without `ctx.skip()`

## Recipe

1. Inspect testing MDX, existing Vitest/Playwright, and CI quality jobs.
2. Understand what “good” means for this change.
3. Identify unprotected critical paths or AI without evals.
4. Propose the smallest useful quality artifact before or alongside implementation.
5. Write criteria that assert behavior. API: one status per `inject()`.
6. Run existing validation — do not invent a parallel suite.
7. Fix failures or escalate when the bar needs a product decision.
8. Update testing MDX when criteria change; update this instance.

## Validation

- Acceptance criteria are testable or demonstrable.
- Critical paths have automated protection where the project supports it.
- Failures produce actionable signal.
- AI evals cover user-dependent behaviors, or are marked unresolved (skip is not a pass).
- CI going green is Pipelines. Meeting the bar is Quality.

## Definition of Done

Stated quality criteria are met and verified by the project's existing validation. Regressions are caught or explicitly accepted with documented rationale.

## Agent Prompt

Apply Quality First to Basilic.

Read `apps/docu/content/docs/testing/`, existing `*.spec.ts` / Playwright specs, and CI gates before implementing. Define what “good” means for this change.

Write or update tests alongside implementation. Use existing commands. For `/ai/*`, do not treat a wrapper unit test as an eval. Never soft-pass remote AI tests. Preserve group-entry and catalog-error patterns. Fix failures or escalate. Update testing docs when criteria change. Update this instance when commands change.

## Notes

**Quality vs Pipelines:** Quality defines what should be validated. Pipelines run the validation.

**Quality vs Product:** Product defines success after use. Quality defines the bar that gates a release.

**Quality vs Data:** Data owns domain invariants. Quality owns release gates and eval datasets.

**Navigation:** [Generic spec](../principles/QUALITY.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/QUALITY.md) · [Factory map](../ABOUT.md) · [Testing](../../apps/docu/content/docs/testing/index.mdx)
