import type { FastifyReply } from 'fastify'
import { applyAcceptVary } from './negotiate.js'

export const agentDiscoveryLinkHeader =
  '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc", </llms.txt>; rel="alternate"; type="text/plain"'

export function applyAgentDiscoveryHeaders({ reply }: { reply: FastifyReply }): FastifyReply {
  return applyAcceptVary({ reply }).header('Link', agentDiscoveryLinkHeader)
}
