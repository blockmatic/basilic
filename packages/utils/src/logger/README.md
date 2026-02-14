# Logger (`@repo/utils/logger`)

Unified logger: browser builds get a console-based logger, Node gets Pino. Resolved via package `exports` (browser vs node). Never use `console.*` directly; use this logger.

**Peer dependencies:** `pino` (server only). None for client.

## API

- **logger** — Root logger with `debug`, `info`, `warn`, `error`, and `child(bindings)`.
- **Logger** — Interface: `(data?, msg?) => void` per level; `child(bindings)` returns a child logger.
- **LogLevel** — `'debug' | 'info' | 'warn' | 'error' | 'silent'`.

```ts
import { logger } from '@repo/utils/logger'

logger.info({ userId: '123' }, 'User logged in')
logger.error({ err }, 'Request failed')

const reqLogger = logger.child({ requestId: 'abc' })
reqLogger.debug(undefined, 'Processing')  // (data?, msg?) — message as second arg
```

## Env (server)

- **LOG_ENABLED** — `true` (default) or `false`
- **LOG_LEVEL** — `debug` | `info` | `warn` | `error` | `silent` (default `info`)
- **LOG_SERVICE** — Service name in base (default `app`)

In CI, or when `NODE_ENV=test` or `VITEST` is set, the default level is `silent` unless `LOG_LEVEL` is explicitly set. Override with `LOG_LEVEL=debug` in `.env.test` to debug tests.

## Env (browser)

- **NEXT_PUBLIC_LOG_ENABLED** — Default off in production
- **NEXT_PUBLIC_LOG_LEVEL** — Same as server

Same CI/test default (`silent`) when `CI`, `NODE_ENV=test`, or `VITEST` is set.

Server logger redacts `authorization`, `password`, `token`, `secret` by default.
