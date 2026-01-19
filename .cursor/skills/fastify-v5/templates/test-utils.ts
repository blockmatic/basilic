import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import app from '../../src/app.js'

/**
 * Builds a test Fastify instance with TypeBox type provider
 * Use this utility in test files to create a test app for blackbox testing
 *
 * @returns Fastify instance configured for testing
 *
 * @example
 * ```typescript
 * import type { FastifyInstance } from 'fastify'
 * import { afterAll, beforeAll, describe, expect, it } from 'vitest'
 * import { buildTestApp } from '../utils/fastify.js'
 *
 * describe('GET /health', () => {
 *   let fastify: FastifyInstance
 *
 *   beforeAll(async () => {
 *     fastify = await buildTestApp()
 *   })
 *
 *   afterAll(async () => {
 *     await fastify.close()
 *   })
 *
 *   it('should return 200 status', async () => {
 *     const response = await fastify.inject({
 *       method: 'GET',
 *       url: '/health',
 *     })
 *
 *     expect(response.statusCode).toBe(200)
 *   })
 * })
 * ```
 */
export async function buildTestApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  }).withTypeProvider<TypeBoxTypeProvider>()

  await fastify.register(app)
  await fastify.ready()
  return fastify
}
