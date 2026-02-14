# Next Steps for E2E

## Current State

- **Local and CI**: `pnpm test:e2e` (from root) runs Fastify E2E + Next E2E, spawning local servers. All tests pass.
- **Test email**: `test@test.ai` when `ALLOW_TEST=true`; token from DB via `/test/magic-link/last`.

## When Ready: E2E Against Vercel Previews

### 1. Vercel — Protection Bypass for Automation

**How to get `VERCEL_AUTOMATION_BYPASS_SECRET`:**

1. In [Vercel Dashboard](https://vercel.com/dashboard), open each project (basilic-next, basilic-fastify)
2. Go to **Settings** → **Deployment Protection**
3. Enable **Protection Bypass for Automation** and click **Generate Secret**
4. Copy the secret (only shown once). Use the **same secret** for both projects.
5. Add to GitHub: repo → Settings → Secrets and variables → Actions → New repository secret → name `VERCEL_AUTOMATION_BYPASS_SECRET`

If you lose it, regenerate in the Vercel project and update GitHub.

### 2. Vercel — ALLOW_TEST

- Both projects: Settings → Environment Variables → `ALLOW_TEST=true` for **Preview** only (not Production)

### 3. Vercel — OPTIONS Allowlist (if CORS fails)

- **basilic-fastify**: Deployment Protection → OPTIONS Allowlist → add `/` or `/auth`

### 4. GitHub Actions — Vercel Preview E2E (optional)

To run E2E against Vercel preview deployments instead of local:

1. Add a job that waits for both Vercel project deployments.
2. Inject `PLAYWRIGHT_APP_URL`, `PLAYWRIGHT_API_URL`, and `VERCEL_AUTOMATION_BYPASS_SECRET`.
3. Run `pnpm --filter @repo/next test:e2e`.

Note: `patrickedqvist/wait-for-vercel-preview` does not support project ID. You may need the Vercel API or a custom script to fetch deployment URLs per project.

### 5. Validate

- **Local**: `pnpm --filter @repo/next test:e2e:local`
- **Full suite**: `pnpm test:e2e` (Fastify + Next)
- **CI (Vercel)**: Push branch after configuring; confirm E2E runs against previews

## Reference

- [E2E Testing](/docs/testing/e2e-testing) — Full documentation
- [Vercel Protection Bypass](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
