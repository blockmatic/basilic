import type { FastifyRequest } from 'fastify'

/**
 * Extract trusted client IP from request.
 * Uses x-forwarded-for (first IP) when present, else request.ip.
 * Aligns with rate-limit plugin key generation for consistent IP-based checks behind proxies.
 */
export function getTrustedClientIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for']
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded
    const first = ips.split(',')[0]?.trim()
    return first && first.length > 0 ? first : (request.ip ?? 'unknown')
  }
  return request.ip ?? 'unknown'
}
