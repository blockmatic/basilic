import type { FastifyReply } from 'fastify'
import { applyAcceptVary } from '../agent/index.js'
import { env } from '../env.js'

export const basilicWwwAuthenticate = 'Bearer realm="Basilic API", ApiKey realm="Basilic API"'

export interface CatalogProblem {
  code: string
  message: string
  type: string
  title: string
  status: number
  detail: string
}

function trimSlash({ url }: { url: string }): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function acceptRangeRank({ offered, type }: { offered: string; type: string }): number | undefined {
  if (offered === type) return 3
  const [offeredType, offeredSubtype] = offered.split('/')
  if (!offeredType || !offeredSubtype) return undefined
  const typeName = type.slice(0, type.indexOf('/'))
  if (offeredType === typeName && offeredSubtype === '*') return 2
  if (offeredType === '*' && offeredSubtype === '*') return 1
  return undefined
}

function acceptQ({
  acceptHeader,
  type,
}: {
  acceptHeader?: string
  type: string
}): number | undefined {
  const raw = acceptHeader?.trim()
  if (!raw) return undefined

  let bestRank = 0
  let bestQ: number | undefined
  for (const part of raw.split(',')) {
    const [typeToken, ...params] = part.trim().split(';')
    const offered = typeToken?.trim().toLowerCase()
    if (!offered) continue
    const rank = acceptRangeRank({ offered, type })
    if (rank === undefined) continue
    const qToken = params.find(p => p.trim().toLowerCase().startsWith('q='))
    const q = qToken ? Number(qToken.trim().slice(2)) : 1
    if (!Number.isFinite(q) || q < 0 || q > 1) continue
    if (rank > bestRank || (rank === bestRank && (bestQ === undefined || q > bestQ))) {
      bestRank = rank
      bestQ = q
    }
  }
  return bestQ
}

export function preferProblemJson({ acceptHeader }: { acceptHeader?: string }): boolean {
  const problemQ = acceptQ({ acceptHeader, type: 'application/problem+json' })
  if (problemQ === undefined || problemQ <= 0) return false
  const jsonQ = acceptQ({ acceptHeader, type: 'application/json' }) ?? 0
  return problemQ >= jsonQ
}

export function toCatalogProblem({
  code,
  message,
  status,
  detail,
}: {
  code: string
  message: string
  status: number
  detail?: string
}): CatalogProblem {
  const resolvedDetail = detail ?? message
  return {
    code,
    message,
    type: `${trimSlash({ url: env.DOCS_SITE_URL })}/docs/architecture/error-handling#${code}`,
    title: message,
    status,
    detail: resolvedDetail,
  }
}

export function applyProblemContentType({ reply }: { reply: FastifyReply }): FastifyReply {
  const acceptHeader =
    typeof reply.request?.headers.accept === 'string' ? reply.request.headers.accept : undefined
  const type = preferProblemJson({ acceptHeader }) ? 'application/problem+json' : 'application/json'
  return applyAcceptVary({ reply }).type(type)
}

export function applyWwwAuthenticate({ reply }: { reply: FastifyReply }): void {
  if (reply.statusCode !== 401) return
  if (reply.getHeader('www-authenticate')) return
  reply.header('WWW-Authenticate', basilicWwwAuthenticate)
}

export function formatIetfRateLimitHeaders({
  max,
  remaining,
  resetSeconds,
  windowSeconds,
}: {
  max: number
  remaining: number
  resetSeconds: number
  windowSeconds: number
}): { rateLimit: string; rateLimitPolicy: string; retryAfter: string } {
  return {
    rateLimitPolicy: `"default";q=${max};w=${windowSeconds}`,
    rateLimit: `"default";r=${remaining};t=${resetSeconds}`,
    retryAfter: String(resetSeconds),
  }
}

function headerNumber({
  reply,
  name,
  fallback,
}: {
  reply: FastifyReply
  name: string
  fallback: number
}): number {
  const raw = reply.getHeader(name)
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function applyIetfRateLimitHeaders({
  reply,
  windowSeconds,
}: {
  reply: FastifyReply
  windowSeconds: number
}): void {
  if (reply.statusCode !== 429) return
  const max = headerNumber({ reply, name: 'x-ratelimit-limit', fallback: env.RATE_LIMIT_MAX })
  const remaining = headerNumber({ reply, name: 'x-ratelimit-remaining', fallback: 0 })
  const resetSeconds = headerNumber({
    reply,
    name: 'x-ratelimit-reset',
    fallback: windowSeconds,
  })
  const headers = formatIetfRateLimitHeaders({
    max,
    remaining,
    resetSeconds,
    windowSeconds,
  })
  reply.header('RateLimit', headers.rateLimit)
  reply.header('RateLimit-Policy', headers.rateLimitPolicy)
  if (!reply.getHeader('retry-after')) reply.header('Retry-After', headers.retryAfter)
}
