import type { FastifyRequest } from 'fastify'

export function logAuthSignal({
  request,
  event,
  code,
  signInMethod,
}: {
  request: FastifyRequest
  event: 'auth_verify_failed' | 'auth_locked'
  code: string
  signInMethod: string
}): void {
  request.log.warn({ code, signInMethod }, event)
}

export function logAuthVerifyFailed(opts: {
  request: FastifyRequest
  code: string
  signInMethod: string
}): void {
  logAuthSignal({ ...opts, event: 'auth_verify_failed' })
}

export function logAuthLocked(opts: {
  request: FastifyRequest
  code: string
  signInMethod: string
}): void {
  logAuthSignal({ ...opts, event: 'auth_locked' })
}
