import { afterAll, beforeAll, vi } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

let fastify: TestApp

beforeAll(async () => {
  await setupGroupDatabase()
  fastify = await buildTestApp()
})

afterAll(async () => {
  if (fastify) await fastify.close()
  await cleanupGroupDatabase()
})

export { fastify }

import './robots.test'
import './sitemap.test'
import './llms-txt.test'
import './well-known/api-catalog.test'
import './well-known/oauth-protected-resource.test'
import './swagger-hide.test'
