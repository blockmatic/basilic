import assert from 'node:assert/strict'
import { test } from 'node:test'

import { envFlagIsTrue, turboChildEnv, turboDevCommand } from './dev.mjs'

test('envFlagIsTrue accepts 1 and true only', () => {
  assert.equal(envFlagIsTrue('true'), true)
  assert.equal(envFlagIsTrue('1'), true)
  assert.equal(envFlagIsTrue('false'), false)
  assert.equal(envFlagIsTrue(undefined), false)
})

test('turboChildEnv sets SKIP_DB_START for the Turbo child only', () => {
  assert.equal(turboChildEnv({ env: { PATH: '/bin' } }).SKIP_DB_START, '1')
  assert.equal(turboChildEnv({ env: { SKIP_DB_START: '1', PATH: '/bin' } }).SKIP_DB_START, '1')
})

test('turboDevCommand runs turbo dev at high concurrency', () => {
  assert.deepEqual(turboDevCommand({ extraArgs: ['--filter=@repo/api'] }), {
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'dev', '--concurrency=20', '--filter=@repo/api'],
  })
  assert.deepEqual(turboDevCommand(), {
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'dev', '--concurrency=20'],
  })
})
