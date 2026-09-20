import { afterAll, beforeAll } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../test/utils/db-setup.js'

beforeAll(async () => {
  await setupGroupDatabase()
})

afterAll(async () => {
  await cleanupGroupDatabase()
})

import './query.test'
import './read.test'
import './search-query.test'
import './seed.test'
import './spoken-summary.test'
