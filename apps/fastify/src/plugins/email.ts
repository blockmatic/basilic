import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Resend } from 'resend'
import type { FakeEmailProvider } from '../../test/utils/fake-email.js'
import type { EmailProvider } from '../lib/email.js'
import { env } from '../lib/env.js'

declare module 'fastify' {
  interface FastifyInstance {
    emailProvider: EmailProvider
    fakeEmail: FakeEmailProvider
  }
}

const resend = new Resend(env.RESEND_API_KEY)

const emailPlugin: FastifyPluginAsync = async fastify => {
  const testProvider =
    typeof globalThis !== 'undefined' ? (globalThis.__testEmailProvider ?? null) : null

  fastify.decorate('emailProvider', testProvider ?? resend)

  // Also decorate fakeEmail when test provider is active (for test access to outbox methods)
  // In production, this won't be decorated, but TypeScript allows it for test contexts
  if (testProvider) {
    fastify.decorate('fakeEmail', testProvider as FakeEmailProvider)
  } else {
    // Decorate with a dummy object in production to satisfy TypeScript
    // Tests will always have the real FakeEmailProvider
    fastify.decorate('fakeEmail', null as unknown as FakeEmailProvider)
  }
}

export default fp(emailPlugin, {
  name: 'email',
  dependencies: [],
})
