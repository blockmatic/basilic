import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Resend } from 'resend'
import type { FakeEmailProvider } from '../../test/utils/fake-email.js'
import type { EmailProvider } from '../lib/email.js'
import { env } from '../lib/env.js'

declare module 'fastify' {
  interface FastifyInstance {
    emailProvider: EmailProvider
    fakeEmail: FakeEmailProvider | null
  }
}

const resend = new Resend(env.RESEND_API_KEY)

const emailPlugin: FastifyPluginAsync = async fastify => {
  const globalTestProvider =
    typeof globalThis !== 'undefined'
      ? ((globalThis as { __testEmailProvider?: EmailProvider }).__testEmailProvider ?? null)
      : null

  let fakeForTestAi: FakeEmailProvider | null = null
  if (env.ALLOW_TEST && !globalTestProvider) {
    const { FakeEmailProvider } = await import('../../test/utils/fake-email.js')
    fakeForTestAi = new FakeEmailProvider()
  }

  let resolvedFake: FakeEmailProvider | null = fakeForTestAi
  if (globalTestProvider) {
    const { FakeEmailProvider } = await import('../../test/utils/fake-email.js')
    resolvedFake =
      globalTestProvider instanceof FakeEmailProvider ? globalTestProvider : fakeForTestAi
  }

  const composite: EmailProvider = {
    emails: {
      send: async options => {
        if (globalTestProvider) return globalTestProvider.emails.send(options)
        const isTestAi = options.to.endsWith('@test.ai')
        if (env.ALLOW_TEST && isTestAi && fakeForTestAi) return fakeForTestAi.emails.send(options)

        return resend.emails.send(options)
      },
    },
  }

  fastify.decorate('emailProvider', composite)
  fastify.decorate('fakeEmail', resolvedFake)
}

export default fp(emailPlugin, {
  name: 'email',
  dependencies: [],
})
