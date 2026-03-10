import type { FastifyRequest } from 'fastify'

/**
 * Extract trusted client IP from request.
 * Uses request.ip which respects Fastify's trustProxy setting.
 */
export function getTrustedClientIp(request: FastifyRequest): string {
  return request.ip ?? 'unknown'
}
