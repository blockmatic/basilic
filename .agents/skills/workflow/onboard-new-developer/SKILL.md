---
name: onboard-new-developer
description: Comprehensive onboarding process to get new developer up and running quickly. Use when the user types /onboard-new-developer.
disable-model-invocation: true
---

Comprehensive onboarding process to get a new developer up and running quickly. Product Ready is this fork-and-run path, not CI green. Canonical checklist: `apps/docu/content/docs/testing/product-ready.mdx`.

1. **Environment setup**: Install required tools, set up development environment, configure IDE/extensions, set up git/SSH keys (Node 24, pnpm from `packageManager`)
2. **Clone and setup**: Run `pnpm setup` at repo root (install, hooks, env templates, Docker/Supabase CLI, Playwright)
3. **Decide context**: Local only, or remote VPC? (Remote VPC = dev machine in cloud; trade-offs: networking, access, cost, latency. See `apps/docu/content/docs/development/dev-environments.mdx`.)
4. **Start local Postgres**: `pnpm --filter @repo/api db:start` (`setup` does not start Supabase)
5. **Reset and seed**: `pnpm reset` from repo root (Supabase reset + Drizzle migrate + seed). See `apps/api/README.md` and ADR 008
6. **Run web/API**: `pnpm dev` (API + Next.js)
7. **First login**: Magic link, or `ALLOW_TEST=true` + `test@test.ai`. Signed-in home is `/`
8. **Run mobile (optional)**: `pnpm --filter @repo/mobile start` (or `start:localhost` / `start:tunnel` for remote). See `apps/docu/content/docs/development/dev-environments.mdx`
9. **Verify**: Web loads, API `GET /health` succeeds, simulator/device can reach the API if running mobile
10. **Project familiarization**: Review `_first/`, Product docs, architecture MDX; run tests when changing code; submit first PR
