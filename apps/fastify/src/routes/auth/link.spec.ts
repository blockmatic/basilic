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

import './link/request.test'
import './link/verify.test'
