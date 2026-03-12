import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { clearSessionPool } from '../../../test/utils/auth-helper.js'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../test/utils/db-setup.js'
import type { TestApp } from '../../../test/utils/fastify.js'
import { buildTestApp } from '../../../test/utils/fastify.js'

let fastify: TestApp

beforeAll(async () => {
  clearSessionPool()
  await setupGroupDatabase()
  fastify = await buildTestApp()
})

beforeEach(() => {
  fastify.fakeEmail?.clear()
})

afterEach(() => {
  fastify.fakeEmail?.clear()
})

afterAll(async () => {
  if (fastify) await fastify.close()
  await cleanupGroupDatabase()
})

export { fastify }

import './link/wallet/verify.test'
import './link/wallet/unlink.test'
import './link/email/request.test'
import './link/email/verify.test'
import './apikeys/create.test'
import './apikeys/list.test'
import './apikeys/revoke.test'
import './link/passkey/delete.test'
import './link/passkey/start.test'
import './link/passkey/finish.test'
import './link/totp/setup.test'
import './link/totp/verify.test'
import './link/totp/unlink.test'
import './link/oauth/unlink.test'
import './email/change/request.test'
import './email/change/verify.test'
import './profile/update.test'
import './passkeys/list.test'
