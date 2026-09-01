import type { FastifyReply } from 'fastify'
import { env } from '../../lib/env.js'

export function assertTestRoutesEnabled(reply: FastifyReply): boolean {
  if (!env.ALLOW_TEST || env.NODE_ENV === 'production') {
    reply.code(404).send({ code: 'NOT_FOUND', message: 'Not found' })
    return false
  }
  return true
}
