import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { applyAcceptVary, getRequestOrigin } from './agent/index.js'

export type OpenApiSpecMedia = 'openapi' | 'json'

interface SpecAcceptOffer {
  kind: OpenApiSpecMedia
  q: number
}

function specMediaKind({ type }: { type: string }): OpenApiSpecMedia | null {
  if (type === 'application/openapi+json') return 'openapi'
  if (type === 'application/json') return 'json'
  return null
}

export function negotiateOpenApiAccept({
  acceptHeader,
}: {
  acceptHeader?: string
}): OpenApiSpecMedia {
  const raw = acceptHeader?.trim()
  if (!raw) return 'json'

  const offers: SpecAcceptOffer[] = []
  for (const part of raw.split(',')) {
    const [typeToken, ...params] = part.trim().split(';')
    const type = typeToken?.trim().toLowerCase()
    if (!type) continue
    const qToken = params.find(p => p.trim().toLowerCase().startsWith('q='))
    const q = qToken ? Number(qToken.trim().slice(2)) : 1
    if (!Number.isFinite(q) || q <= 0) continue
    const kind = specMediaKind({ type })
    if (kind) offers.push({ kind, q })
  }
  if (offers.length === 0) return 'json'
  return offers.reduce((winner, offer) => (offer.q > winner.q ? offer : winner)).kind
}

export function getLiveOpenApiDocument({
  fastify,
  request,
}: {
  fastify: FastifyInstance
  request: FastifyRequest
}): ReturnType<FastifyInstance['swagger']> & { servers: { url: string }[] } {
  return {
    ...fastify.swagger(),
    servers: [{ url: getRequestOrigin({ request }) }],
  }
}

export function sendOpenApiDocument({
  fastify,
  request,
  reply,
}: {
  fastify: FastifyInstance
  request: FastifyRequest
  reply: FastifyReply
}): FastifyReply {
  const media = negotiateOpenApiAccept({
    acceptHeader: typeof request.headers.accept === 'string' ? request.headers.accept : undefined,
  })
  const type = media === 'openapi' ? 'application/openapi+json' : 'application/json'
  return applyAcceptVary({ reply }).type(type).send(getLiveOpenApiDocument({ fastify, request }))
}
