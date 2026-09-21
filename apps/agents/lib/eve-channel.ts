import { ForbiddenError, localDev, vercelOidc } from 'eve/channels/auth'
import { defaultEveAuth, eveChannel } from 'eve/channels/eve'
import { basilicAccessJwt } from './auth.js'
import { channelCors } from './cors.js'
import { env } from './env.js'
import { inspectSessionPayload } from './ingress.js'
import { consumeRateLimit } from './rate-limit.js'

const hitsByPrincipal = new Map<string, number[]>()

async function basilicAccessJwtWithLimit(request: Request) {
  const auth = await basilicAccessJwt()(request)
  if (!auth) return null
  const key = auth.principalId
  const current = hitsByPrincipal.get(key) ?? []
  const result = consumeRateLimit({
    hits: current,
    now: Date.now(),
    windowMs: env.EVE_RATE_LIMIT_WINDOW_MS,
    max: env.EVE_RATE_LIMIT_MAX,
  })
  hitsByPrincipal.set(key, result.hits)
  if (!result.ok)
    throw new ForbiddenError({
      code: 'rate_limited',
      message: `Rate limit exceeded. Retry after ${result.retryAfterSeconds}s`,
    })
  return auth
}

export function createBasilicEveChannel() {
  return eveChannel({
    auth: [basilicAccessJwtWithLimit, vercelOidc(), localDev()],
    cors: channelCors(),
    async onMessage(ctx, message) {
      const body = await ctx.eve.request
        .clone()
        .json()
        .catch(() => ({ message }))
      const inspected = inspectSessionPayload({ body })
      if (!inspected.ok)
        throw new ForbiddenError({ code: 'invalid_request', message: inspected.message })
      return { auth: defaultEveAuth(ctx) }
    },
  })
}
