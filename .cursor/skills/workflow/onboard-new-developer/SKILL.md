---
name: onboard-new-developer
description: Comprehensive onboarding process to get new developer up and running quickly. Use when the user types /onboard-new-developer.
disable-model-invocation: true
---

Comprehensive onboarding process to get new developer up and running quickly.

1. **Environment setup**: Install required tools, set up development environment, configure IDE/extensions, set up git/SSH keys
2. **Clone and setup**: Run `pnpm setup` at repo root
3. **Decide context**: Local only, or remote VPC? (Remote VPC = dev machine in cloud; trade-offs: networking, access, cost, latency. See `apps/docu/content/docs/development/dev-environments.mdx`.)
4. **Run web/API**: `pnpm dev` (API + Next.js)
5. **Run mobile (optional)**: `pnpm --filter @repo/mobile start` (or `start:localhost` / `start:tunnel` for remote). See `apps/docu/content/docs/development/dev-environments.mdx`
6. **Verify**: Simulator/device can load the app and reach the API
7. **Project familiarization**: Review project structure, understand architecture, read key documentation, set up local database, verify all tests passing, submit first PR

