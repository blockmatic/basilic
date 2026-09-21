import assert from 'node:assert/strict'
import { test } from 'node:test'

import { envFlagIsTrue, parseEnvFlag, shouldSkipDbStart, turboDevCommand } from './dev.mjs'

test('envFlagIsTrue accepts 1 and true only', () => {
  assert.equal(envFlagIsTrue('true'), true)
  assert.equal(envFlagIsTrue('1'), true)
  assert.equal(envFlagIsTrue('false'), false)
  assert.equal(envFlagIsTrue(undefined), false)
})

test('parseEnvFlag reads unquoted and quoted keys and ignores comments', () => {
  const text = ['# PGLITE=true', 'PGLITE=false', 'DATABASE_URL=postgres://x'].join('\n')
  assert.equal(parseEnvFlag(text, 'PGLITE'), 'false')
  assert.equal(parseEnvFlag('PGLITE="true"\n', 'PGLITE'), 'true')
  assert.equal(parseEnvFlag(undefined, 'PGLITE'), undefined)
})

test('shouldSkipDbStart honors SKIP_DB_START, PGLITE env, and api .env', () => {
  assert.equal(shouldSkipDbStart({ env: { SKIP_DB_START: '1' } }), true)
  assert.equal(shouldSkipDbStart({ env: { PGLITE: 'true' } }), true)
  assert.equal(shouldSkipDbStart({ env: {}, apiEnvText: 'PGLITE=true\n' }), true)
  assert.equal(shouldSkipDbStart({ env: {}, apiEnvText: 'PGLITE=false\n' }), false)
  assert.equal(shouldSkipDbStart({ env: {} }), false)
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
