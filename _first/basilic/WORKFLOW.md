# Workflow First

## Principle

See /f-workflow.

## Artifacts

- **Fact:** Work state: GitHub Issues and pull requests. There is no `BACKLOG.md`. `__dev/` is gitignored scratch, not the backlog.
- **Fact:** Path: plan (`/plan-feature`) → review → `/build` → `/git-commit` → `/git-create-pr` → CI + CodeRabbit → `/retro`. Use `/exec-push` only when the full implementation-to-PR path is requested.
- **Fact:** Index: [ai-workflow.mdx](../../apps/docu/content/docs/development/ai-workflow.mdx)
- **Fact:** Playbooks: `.agents/skills/workflow/` — `/workflow` dispatcher and unprefixed children; shared authoring and completion references are packaged inside that tree
- **Fact:** Consequential decisions: product intent in [PRODUCT.md](PRODUCT.md); technical in ADRs and `apps/docu`
- **Fact:** Git: default global user; Conventional Commits; never `--no-verify`; never Co-authored-by trailers ([git.mdc](../../.cursor/rules/base/git.mdc)). Squash-merge uses `PR_TITLE` + `PR_BODY` so `BREAKING CHANGE:` footers survive. Conventional PR titles are gated.
- **Fact:** Advisory `/release-review` playbook. AI does not bump versions, merge release PRs, or hold npm credentials.
- **Fact:** Human gates: product scope, secrets/trust boundaries, destructive ops ([`../AGENTS.md`](../AGENTS.md))
- **Fact:** Models (docs): Grok 4.6 plan/implement; Sol long-horizon; Composer 2.5 mechanical. In-app chat is a product model, not this workflow.

Automated path:

- **Fact:** [github-actions.mdx](../../apps/docu/content/docs/deployment/github-actions.mdx)
- **Fact:** [`.github/workflows/lint.yml`](../../.github/workflows/lint.yml) — Biome/ESLint/types. FIRST factory validation lives in [`blockmatic/first`](https://github.com/blockmatic/first)
- **Fact:** [`.github/workflows/security.yml`](../../.github/workflows/security.yml), [`.github/workflows/deepsec.yml`](../../.github/workflows/deepsec.yml)
- **Fact:** Path-filtered: `api-e2e.yml` (OpenAPI drift + cov), `web-e2e.yml`, `packages-test.yml`
- **Fact:** Always-reportable: `pr-title.yml`, `scaffold.yml` (classification + generator tests), `release-impact.yml`. Full generated `pnpm qa` on release-please PRs (`scaffold-acceptance.yml`).
- **Fact:** Mobile: `mobile-build.yml`, `mobile-preview.yml`, `mobile-pr-preview.yml` ([mobile-cicd.mdx](../../apps/docu/content/docs/deployment/mobile-cicd.mdx))
- **Fact:** Local: `pnpm qa` via [`../../scripts/run-qa.mjs`](../../scripts/run-qa.mjs) — checktypes → lint → generate + drift → build → unit → e2e (`SKIP_BUILD=1`)
- **Fact:** Vercel git deploys web/api/docu ([vercel.mdx](../../apps/docu/content/docs/deployment/vercel.mdx)). CI does **not** deploy. Preview migrate gated unless `RUN_PG_MIGRATE=true`.
- **Fact:** `web-e2e` chat project runs only when a non-placeholder Anthropic key is present (`hasRealAnthropicKey()`: empty, `sk-ant-xxx`, and `sk-ant-dummy*` omit it); auth/dashboard E2E still run on forks
- **Fact:** R0 is documentation alignment. Basilic **distribution** uses GitHub Releases + npm after a maintainer merges the Release Please PR. Preview deploys still run from git as usual.
- **Fact:** Vercel git deploys `apps/web`, `apps/api`, and `apps/docu`. EAS workflows deploy mobile. Those are app delivery, not Basilic npm distribution ([publishing.mdx](../../apps/docu/content/docs/deployment/publishing.mdx), [ADR 012](../../apps/docu/content/docs/adrs/012-scaffolding-and-releases.mdx)).
- **Fact:** Version lives on the repo root (`package.json` `version`) and is synced into `tools/create-basilic/package.json`. Tag format `vX.Y.Z`.
- **Fact:** After the tag, `publish-create-basilic.yml` assembles and packs **once**, tests that tarball, publishes it with npm trusted publishing (`id-token` only on that job), and attaches the same file to the GitHub Release.
- **Fact:** Artifact identity: SHA-256 of the packed tarball. Do not rebuild at publish. Retry GitHub asset upload from the retained artifact; never overwrite an npm version. Vercel and EAS still rebuild from git.
- **Fact:** Preview: manual `0.1.0-next.1` with npm dist-tag `next`, not `latest`. Stable `1.0.0` only after Product Ready from `npx create-basilic@<version>`.
- **Fact:** Generated repos do not receive Release Please, the publish workflow, or npm credentials.
- **Fact:** Product Ready does not require a GitHub Release. Distribution releases are a separate automated path.

## Minimum Useful Artifact

- intent, owner, visible state: issue or PR
- plan and acceptance criteria: `/plan-feature` for non-trivial work
- actors: human, agent, CI, CodeRabbit
- gates: product, security, destructive — ask a human
- validation: Product Ready for adopter bar; CI for Workflow; learning: `/retro` and durable files when decisions changed
- local mirror: `pnpm qa`, `pnpm lint`, `pnpm checktypes`
- failures: `gh pr checks` / `gh run view` (`/fix-github-actions`); never GitHub MCP for Actions logs
- commit-stage artifact: release tag SHA; packed tarball + SHA-256; promotion is maintainer merge → pack once → npm + GitHub asset; rollback is patch + deprecate, never rewrite tags

## Notes

Quality names the bar. Workflow runs it. Architecture defines deployment units. Operations runs what arrived. Never `--no-verify`. A green local sandbox is not GitHub Actions.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/WORKFLOW.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/WORKFLOW.md) · [Factory map](../ABOUT.md) · [AI workflow](../../apps/docu/content/docs/development/ai-workflow.mdx) · [GitHub Actions](../../apps/docu/content/docs/deployment/github-actions.mdx) · [Publishing](../../apps/docu/content/docs/deployment/publishing.mdx)
