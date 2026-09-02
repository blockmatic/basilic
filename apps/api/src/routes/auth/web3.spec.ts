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

import './web3/exchange.test'
import './web3/nonce.test'
import './web3/eip155/nonce.test'
import './web3/eip155/verify.test'
import './web3/solana/nonce.test'
import './web3/solana/verify.test'
import '../../lib/web3/domain.test.js'
