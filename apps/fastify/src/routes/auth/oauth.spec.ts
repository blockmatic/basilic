import { afterAll, beforeAll } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../test/utils/db-setup.js'
import type { TestApp } from '../../../test/utils/fastify.js'
import { buildTestApp } from '../../../test/utils/fastify.js'

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

import './oauth/facebook/authorize-url.test'
import './oauth/providers.test'
import './oauth/facebook/exchange.test'
import './oauth/github/authorize.test'
import './oauth/github/authorize-url.test'
import './oauth/github/exchange.test'
import './oauth/google/authorize-url.test'
import './oauth/google/exchange.test'
import './oauth/google/verify-id-token.test'
import './oauth/twitter/authorize-url.test'
import './oauth/twitter/exchange.test'
