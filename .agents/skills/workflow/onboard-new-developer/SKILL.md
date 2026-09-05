---
name: onboard-new-developer
description: Comprehensive onboarding process to get new developer up and running quickly. Use when the user types /onboard-new-developer.
disable-model-invocation: true
---

## Purpose

Comprehensive onboarding process to get new developer up and running quickly.

## Steps

1. **Environment setup**: Install required tools, set up development environment, configure IDE/extensions, set up git/SSH keys
2. **Clone and setup**: Run `pnpm setup` at repo root
3. **Decide context**: Local only, or remote VPC? See the development-environments page from the technical docs path in `AGENTS.md`.
4. **Run web/API**: `pnpm dev` (API + Next.js)
5. **Run mobile (optional)**: `pnpm --filter @repo/mobile start` (or `start:localhost` / `start:tunnel` for remote). See the development-environments page from the technical docs path in `AGENTS.md`.
6. **Verify**: Simulator/device can load the app and reach the API
7. **Project familiarization**: Review project structure, architecture, and key docs; set up the local database; verify tests pass. Point at `/git-create-pr` when they are ready. Do not open a PR unless asked.

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
