# @repo/utils

Shared utility library for the Basilic monorepo. Prefer subpath imports; details and peer deps live in each module's README.

- [async](src/async/README.md) — `@repo/utils/async`
- [data](src/data/README.md) — `@repo/utils/data`
- [debug](src/debug/README.md) — `@repo/utils/debug`
- [logger](src/logger/README.md) — `@repo/utils/logger/server`, `@repo/utils/logger/client`
- [view-config](src/view-config.ts) — `@repo/utils/view-config` (closed board ViewConfig; eve `set_view` and the Next board URL)
- [web3](src/web3/README.md) — `@repo/utils/web3`

## Scripts

- `pnpm --filter @repo/utils build` - Build package (`dist/` is what eve and Fastify import; required after a new subpath before those tests)
- `pnpm --filter @repo/utils checktypes` - Type-check
