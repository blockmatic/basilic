import { afterAll, beforeAll } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../test/utils/db-setup.js'

beforeAll(async () => {
  await setupGroupDatabase()
})

afterAll(async () => {
  await cleanupGroupDatabase()
})

import './read.test'
import './seed.test'
