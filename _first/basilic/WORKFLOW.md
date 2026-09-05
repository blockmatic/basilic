# Workflow First

## Principle

See /f-workflow.

## Artifacts

- **Fact:** Work state: GitHub Issues and pull requests. There is no `BACKLOG.md`. `__dev/` is gitignored scratch, not the backlog.
- **Fact:** Path: plan (`/b-plan-feature`) → review → `/b-build` → `/b-git-commit` → `/b-git-create-pr` → CI + CodeRabbit → `/b-retro`. Use `/b-exec-push` only when the full implementation-to-PR path is requested.
- **Fact:** Index: [ai-workflow.mdx](../../apps/docu/content/docs/development/ai-workflow.mdx)
- **Fact:** Playbooks: `.agents/skills/b/` — `/b` dispatcher and `/b-*` children; shared authoring and completion references are packaged inside that tree
- **Fact:** Consequential decisions: product intent in [PRODUCT.md](PRODUCT.md); technical in ADRs and `apps/docu`
- **Fact:** Git: default global user; Conventional Commits; never `--no-verify`; never Co-authored-by trailers ([git.mdc](../../.cursor/rules/base/git.mdc))
- **Fact:** Human gates: product scope, secrets/trust boundaries, destructive ops ([`../AGENTS.md`](../AGENTS.md))
- **Fact:** Models (docs): Grok 4.6 plan/implement; Sol long-horizon; Composer 2.5 mechanical. In-app chat is a product model, not this workflow.

Automated path:

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

- intent, owner, visible state: issue or PR
- plan and acceptance criteria: `/b-plan-feature` for non-trivial work
- actors: human, agent, CI, CodeRabbit
- gates: product, security, destructive — ask a human
- validation: Product Ready for adopter bar; CI for Workflow; learning: `/b-retro` and durable files when decisions changed
- local mirror: `pnpm qa`, `pnpm lint`, `pnpm checktypes`
- failures: `gh pr checks` / `gh run view` (`/b-fix-github-actions`); never GitHub MCP for Actions logs

## Notes

Quality names the bar. Workflow runs it. Architecture defines deployment units. Operations runs what arrived. Never `--no-verify`. A green local sandbox is not GitHub Actions.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/WORKFLOW.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/WORKFLOW.md) · [Factory map](../ABOUT.md) · [AI workflow](../../apps/docu/content/docs/development/ai-workflow.mdx) · [GitHub Actions](../../apps/docu/content/docs/deployment/github-actions.mdx)
