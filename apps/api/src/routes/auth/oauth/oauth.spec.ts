import { afterAll, beforeAll } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../../test/utils/db-setup.js'
import type { TestApp } from '../../../../test/utils/fastify.js'
import { buildTestApp } from '../../../../test/utils/fastify.js'

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

import './github/link-authorize-url.test'
import './google/link-authorize-url.test'
import './facebook/link-authorize-url.test'
import './twitter/link-authorize-url.test'
import './facebook/authorize-url.test'
import './providers.test'
import './facebook/exchange.test'
import './github/authorize-url.test'
import './github/exchange.test'
import './google/authorize-url.test'
import './google/exchange.test'
import './google/verify-id-token.test'
import './twitter/authorize-url.test'
import './twitter/exchange.test'
