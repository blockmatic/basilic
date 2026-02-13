import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import app from '../../src/app.js'
import { setTestEmailProvider } from '../../src/lib/auth.js'
import { FakeEmailProvider } from './fake-email.js'

export async function buildTestApp(): Promise<FastifyInstance> {
  // Create fake email provider first
  const fakeEmailProvider = new FakeEmailProvider()

  // Set test email provider BEFORE creating Fastify instance
  setTestEmailProvider(fakeEmailProvider)

  const fastify = Fastify({
    logger: { level: process.env.DEBUG_TEST ? 'info' : 'silent' },
  }).withTypeProvider<TypeBoxTypeProvider>()

  await fastify.register(app)
  await fastify.ready()

  // Attach fake email provider to fastify instance for test access
  ;(fastify as FastifyInstance & { fakeEmail: FakeEmailProvider }).fakeEmail = fakeEmailProvider

  return fastify as FastifyInstance & { fakeEmail: FakeEmailProvider }
}

export type TestApp = Awaited<ReturnType<typeof buildTestApp>>
