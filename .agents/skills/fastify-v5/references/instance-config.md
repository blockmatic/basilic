# Fastify Instance Configuration

Configure Fastify instance with TypeBox type provider, logger, request settings, and other options.

## Basic Configuration

```typescript
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>()
```

## Logger Configuration

Configure Pino logger with different levels and transports:

```typescript
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
}).withTypeProvider<TypeBoxTypeProvider>()
```

### Logger Levels

- `fatal` - Fatal errors
- `error` - Errors
- `warn` - Warnings
- `info` - Informational messages (default in production)
- `debug` - Debug messages (default in development)
- `trace` - Trace messages

## Request ID Configuration

Configure request ID tracking for request correlation:

```typescript
const fastify = Fastify({
  requestIdHeader: 'x-request-id', // Header name for request ID
  requestIdLogLabel: 'reqId', // Label in logs
  disableRequestLogging: false, // Enable request logging
}).withTypeProvider<TypeBoxTypeProvider>()
```

## Proxy Configuration

Configure proxy trust for production deployments:

```typescript
const fastify = Fastify({
  trustProxy: true, // Trust X-Forwarded-* headers
}).withTypeProvider<TypeBoxTypeProvider>()
```

## Request Limits

Configure request body size and timeout limits:

```typescript
const fastify = Fastify({
  bodyLimit: 1048576, // 1MB (default)
  requestTimeout: 30000, // 30 seconds (default)
}).withTypeProvider<TypeBoxTypeProvider>()
```

## Complete Configuration Example

```typescript
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
  trustProxy: process.env.TRUST_PROXY === 'true',
  bodyLimit: parseInt(process.env.BODY_LIMIT ?? '1048576', 10),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT ?? '30000', 10),
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
}).withTypeProvider<TypeBoxTypeProvider>()
```

## Type Provider Setup

Always use `.withTypeProvider<TypeBoxTypeProvider>()` for type-safe routes:

```typescript
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'

const fastify = Fastify({
  // ... options
}).withTypeProvider<TypeBoxTypeProvider>()

// Now routes have type inference from TypeBox schemas
fastify.get('/users/:id', {
  schema: {
    params: Type.Object({ id: Type.String() }),
  },
}, async (request, reply) => {
  // request.params.id is typed as string
  const { id } = request.params
})
```

## Server Startup

Start server with host and port:

```typescript
const start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT ?? '3000', 10),
      host: process.env.HOST ?? '0.0.0.0',
    })
    fastify.log.info({ port: process.env.PORT }, 'Server started')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

## Graceful Shutdown

Handle process signals for graceful shutdown:

```typescript
const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Shutting down')
  try {
    await fastify.close()
    fastify.log.info('Server closed')
    process.exit(0)
  } catch (err) {
    fastify.log.error({ err }, 'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('uncaughtException', err => {
  fastify.log.error({ err }, 'Uncaught exception')
  shutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error({ reason, promise }, 'Unhandled rejection')
  shutdown('unhandledRejection')
})
```

## Configuration Best Practices

- Always use `.withTypeProvider<TypeBoxTypeProvider>()` for type safety
- Configure logger level based on environment
- Use `pino-pretty` transport in development for readable logs
- Set `trustProxy: true` when behind reverse proxy
- Configure appropriate `bodyLimit` and `requestTimeout` values
- Use request ID tracking for request correlation in logs
- Implement graceful shutdown handlers
- Handle uncaught exceptions and unhandled rejections

## Environment Variables

Use environment variables for configuration:

```typescript
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  trustProxy: process.env.TRUST_PROXY === 'true',
  bodyLimit: parseInt(process.env.BODY_LIMIT ?? '1048576', 10),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT ?? '30000', 10),
}).withTypeProvider<TypeBoxTypeProvider>()
```

## See Also

- [Fastify Options](https://fastify.dev/docs/latest/Reference/Server/#factory) - Complete Fastify options reference
- [Pino Logger](https://getpino.io/) - Logger documentation
