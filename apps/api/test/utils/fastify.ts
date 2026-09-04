import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import app from '../../src/app.js'
import { setTestEmailProvider } from '../../src/lib/email.js'
import { createApiLoggerOptions } from '../../src/lib/http-logging.js'
import { FakeEmailProvider } from './fake-email.js'

export async function buildTestApp(): Promise<FastifyInstance> {
  const fakeEmailProvider = new FakeEmailProvider()
  setTestEmailProvider(fakeEmailProvider)

  const logLevel =
    (process.env.TEST_LOG_LEVEL as 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug') ??
    'silent'
  const fastify = Fastify({
    ...createApiLoggerOptions({ level: logLevel }),
    pluginTimeout: 30_000,
    trustProxy: true,
  }).withTypeProvider<TypeBoxTypeProvider>()

  await fastify.register(app)
  await fastify.ready()

  // Attach fake email provider to fastify instance for test access
  ;(fastify as FastifyInstance & { fakeEmail: FakeEmailProvider }).fakeEmail = fakeEmailProvider

  return fastify as FastifyInstance & { fakeEmail: FakeEmailProvider }
}

export type TestApp = Awaited<ReturnType<typeof buildTestApp>>
