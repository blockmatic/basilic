# Pipelines First

## Principle

Treat automated validation and delivery as part of the development feedback loop — including the agent feedback loop — not as a ritual after the real work.

## Statement

A change is not done when it compiles on my machine. It is done when it passes the same checks everyone else relies on, and when it can reach the environment it needs to reach. For agents, CI is ground truth: implement, run checks, read failures, fix or escalate, run again. I keep the path from source to deployable explicit at the level the project actually needs.

## Outcome

Changes flow through an automated path: format → lint → typecheck → test → build → preview (if applicable) → deploy → verify. The commit stage builds the artifact once. Later stages promote that artifact; they do not rebuild a different one per environment. Agents can interpret CI failure output and act.

## Artifacts

- **Fact:** [github-actions.mdx](../../apps/docu/content/docs/deployment/github-actions.mdx)
- **Fact:** [`.github/workflows/lint.yml`](../../.github/workflows/lint.yml) — Biome/ESLint/types. FIRST factory validation lives in [`blockmatic/first`](https://github.com/blockmatic/first)
- **Fact:** [`.github/workflows/security.yml`](../../.github/workflows/security.yml), [`.github/workflows/deepsec.yml`](../../.github/workflows/deepsec.yml)
- **Fact:** Path-filtered: `api-e2e.yml` (OpenAPI drift + cov), `web-e2e.yml`, `packages-test.yml`
- **Fact:** Mobile: `mobile-build.yml`, `mobile-preview.yml`, `mobile-pr-preview.yml` ([mobile-cicd.mdx](../../apps/docu/content/docs/deployment/mobile-cicd.mdx))
- **Fact:** Local: `pnpm qa` via [`../../scripts/run-qa.mjs`](../../scripts/run-qa.mjs) — checktypes → lint → generate + drift → build → unit → e2e (`SKIP_BUILD=1`)
- **Fact:** Vercel git deploys web/api/docu ([vercel.mdx](../../apps/docu/content/docs/deployment/vercel.mdx)). CI does **not** deploy. Preview migrate gated unless `RUN_PG_MIGRATE=true`.
- **Fact:** `web-e2e` chat project runs only when a non-placeholder Anthropic key is present (`hasRealAnthropicKey()`: empty, `sk-ant-xxx`, and `sk-ant-dummy*` omit it); auth/dashboard E2E still run on forks
- **Fact:** R0 is documentation alignment. It does not require a GitHub Release or a version bump. Preview deploys still run from git as usual.
- **Unresolved:** commit-stage artifact identity and promote-without-rebuild (hosts rebuild from git)

## Minimum Useful Artifact

- triggers: every PR for lint/security; path filters for e2e/packages; EAS on mobile paths
- local mirror: `pnpm qa`, `pnpm lint`, `pnpm checktypes`
- artifact: **unresolved** (git SHA on Vercel/EAS)
- promotion: preview on PR, prod on main — rebuild, not promote
- failures: `gh pr checks` / `gh run view` (`/fix-github-actions`); never GitHub MCP for Actions logs

## Recipe

1. Inspect `.github/workflows/`, `turbo.json`, deployment MDX, `pnpm qa`.
2. Understand path from change to Vercel/EAS/API host.
3. Identify missing checks, flaky jobs, unreadable logs.
4. Propose the smallest pipeline improvement.
5. Implement. Prefer existing `pnpm` scripts.
6. Verify locally with the same commands CI uses when possible.
7. Read CI output with `gh`. Fix or escalate.
8. Document deploy steps in deployment MDX if they changed.

## Validation

- CI passes on the change branch.
- Local `pnpm qa` / targeted scripts catch the same class of failure.
- A green agent sandbox is not GitHub Actions.
- Deploy path is documented. Promote-without-rebuild is unresolved, not pretended.

## Definition of Done

The change is validated by automated pipelines and is deployable through the project's defined path. Pipeline config is updated if new checks were added.

## Agent Prompt

Apply Pipelines First to Basilic.

Read `.github/workflows/`, `turbo.json`, deployment MDX, and root README scripts before changing delivery. Use existing commands — `pnpm qa` when the change warrants it.

When implementation completes, ensure CI would pass. Read failures with `gh` (not GitHub MCP). Do not treat a green local sandbox as the pipeline. Distinguish pipeline failures from quality criteria. Update deployment docs when delivery changes. Update this instance when workflows or commands change.

## Notes

**Pipelines vs Workflow:** Pipelines automate validation and delivery. Workflow defines how humans and agents respond.

**Pipelines vs Architecture:** Architecture defines deployment units. Pipelines build and deliver them.

**Pipelines vs Quality:** Quality names the bar. Pipelines run it.

**Pipelines vs Operations:** Pipelines get changes into production. Operations runs what arrived.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/PIPELINES.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/PIPELINES.md) · [Factory map](../ABOUT.md) · [GitHub Actions](../../apps/docu/content/docs/deployment/github-actions.mdx)
