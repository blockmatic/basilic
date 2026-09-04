# Logger

Explicit subpath imports: `@repo/utils/logger/server` (Pino, Node) and `@repo/utils/logger/client` (console, browser). Never use `console.*` directly.

**Peer dependencies:** `pino` (server only). None for client.

## API

- **logger** — Root logger with `debug`, `info`, `warn`, `error`, and `child(bindings)`.
- **Logger** — Interface: `(data?, msg?) => void` per level; `child(bindings)` returns a child logger.
- **LogLevel** — `'debug' | 'info' | 'warn' | 'error' | 'silent'`.

Canonical call shapes:

```ts
logger.info('message')
logger.info({ userId: '123' }, 'User logged in')
logger.error({ err, reqId }, 'Request failed')

const reqLogger = logger.child({ reqId: 'abc' })
reqLogger.debug('Processing request')
```

`Error` values become `{ err: { type, message, stack? } }`. Structured context is sanitized (sensitive keys at any depth).

## Env (server)

- **LOG_ENABLED** — `true` (default) or `false`. Truthy: `1`, `true`, `yes`, `on`.
- **LOG_LEVEL** — `debug` | `info` | `warn` | `error` | `silent` (default `info`)
- **LOG_SERVICE** — Service name in base (default `app`)

In CI, or when `NODE_ENV=test` or `VITEST` is set, the default level is `silent` unless `LOG_LEVEL` is explicitly set.

`createPinoOptions()` is the shared Fastify/Pino policy. Fastify HTTP logging uses that factory; this package's server singleton is for scripts, Next server, and non-request paths.

## Env (browser)

- **NEXT_PUBLIC_LOG_ENABLED** — Default off in production. Same `parseBool` as server (do not use Zod `coerce.boolean()`, which treats `"false"` as true).
- **NEXT_PUBLIC_LOG_LEVEL** — Same as server

Debug/info/warn follow those flags. **`error` still emits in production** when logging is otherwise disabled, unless `NEXT_PUBLIC_LOG_LEVEL=silent` or the process is test/CI.

## Redaction

- Pino path redaction (`pinoRedactPaths`) is separate from recursive `sanitizeLogData`.
- `pathOnlyUrl` strips query and hash. Log pathnames only, never query strings.
- Join key field name is **`reqId`**, never `requestId`.
