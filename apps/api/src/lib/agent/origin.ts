import type { FastifyRequest } from 'fastify'
import { env } from '../env.js'

export const publicDiscoveryPaths = [
  '/',
  '/reference',
  '/openapi.json',
  '/health',
  '/llms.txt',
  '/sitemap.xml',
  '/.well-known/api-catalog',
  '/.well-known/oauth-protected-resource',
] as const

export function getRequestOrigin({ request }: { request: FastifyRequest }): string {
  const host = request.headers.host || `${request.hostname}:${env.PORT}`
  return new URL(`${request.protocol}://${host}`).origin
}
