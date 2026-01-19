# Plugin Development Patterns

Plugins extend Fastify with reusable functionality. Use `fastify-plugin` to create non-encapsulated plugins that share context across the application.

## Basic Plugin Pattern

```typescript
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

type PluginOptions = {
  // Define plugin options
}

const myPlugin: FastifyPluginAsync<PluginOptions> = async (fastify, opts) => {
  // Plugin implementation
}

export default fp(myPlugin, {
  name: 'my-plugin',
})
```

## Plugin Registration

Register plugins in your app:

```typescript
import myPlugin from './plugins/my-plugin.js'

await fastify.register(myPlugin, {
  // Plugin options
})
```

## Plugin with Decorators

Add decorators to extend Fastify instance:

```typescript
const myPlugin: FastifyPluginAsync = async fastify => {
  fastify.decorate('myUtility', () => {
    // Utility function available on fastify instance
  })
  
  // Type declaration for TypeScript
  declare module 'fastify' {
    interface FastifyInstance {
      myUtility(): void
    }
  }
}
```

## Plugin with Routes

Plugins can register routes:

```typescript
const routesPlugin: FastifyPluginAsync = async fastify => {
  fastify.get('/plugin-route', async (request, reply) => {
    return reply.send({ message: 'From plugin' })
  })
}
```

## Plugin Options Typing

Type plugin options for type safety:

```typescript
type RateLimitOptions = {
  max: number
  timeWindow: number
}

const rateLimitPlugin: FastifyPluginAsync<RateLimitOptions> = async (fastify, opts) => {
  // opts.max and opts.timeWindow are typed
}
```

## Conditional Plugin Registration

Register plugins conditionally:

```typescript
const conditionalPlugin: FastifyPluginAsync = async fastify => {
  if (process.env.FEATURE_ENABLED === 'true') {
    await fastify.register(somePlugin)
  }
}
```

## Plugin Dependencies

Plugins can depend on other plugins:

```typescript
const dependentPlugin: FastifyPluginAsync = async fastify => {
  // Ensure required plugin is registered first
  await fastify.register(requiredPlugin)
  
  // Now use functionality from requiredPlugin
}
```

## Common Plugin Patterns

### Rate Limiting Plugin

```typescript
import rateLimit from '@fastify/rate-limit'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const rateLimitPlugin: FastifyPluginAsync = async fastify => {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: 60000,
    keyGenerator: request => request.ip,
  })
}

export default fp(rateLimitPlugin, { name: 'rate-limit' })
```

### CORS Plugin

```typescript
import cors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const corsPlugin: FastifyPluginAsync = async fastify => {
  await fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed'), false)
      }
    },
    credentials: false,
  })
}

export default fp(corsPlugin, { name: 'cors' })
```

## Best Practices

- Always use `fastify-plugin` wrapper (`fp()`) for plugins that need to share context
- Name plugins explicitly for better debugging
- Type plugin options for type safety
- Use `FastifyPluginAsync` type for async plugins
- Register plugins in logical order (dependencies first)
- Keep plugins focused and single-purpose

## See Also

- [Plugin Template](@cursor/skills/fastify-v5/templates/plugin.ts) - Complete plugin example
- [Hook Plugin Template](@cursor/skills/fastify-v5/templates/hook-plugin.ts) - Plugin with hooks
- [Fastify Plugins Guide](https://fastify.dev/docs/latest/Guides/Plugins-Guide/)
