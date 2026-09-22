import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  ensurePortlessProxy,
  envFlagIsTrue,
  portlessProxyPort,
  shouldEnsurePortlessProxy,
  turboChildEnv,
  turboDevCommand,
} from './dev.mjs'

test('envFlagIsTrue accepts 1 and true only', () => {
  assert.equal(envFlagIsTrue('true'), true)
  assert.equal(envFlagIsTrue('1'), true)
  assert.equal(envFlagIsTrue('false'), false)
  assert.equal(envFlagIsTrue(undefined), false)
})

test('turboChildEnv sets SKIP_DB_START and named local URLs', () => {
  const env = turboChildEnv({ env: { PATH: '/bin' } })
  assert.equal(env.SKIP_DB_START, '1')
  assert.equal(env.NEXT_PUBLIC_API_URL, 'https://api.basilic.localhost')
  assert.equal(env.NEXT_PUBLIC_APP_URL, 'https://basilic.localhost')
  assert.equal(turboChildEnv({ env: { SKIP_DB_START: '1', PATH: '/bin' } }).SKIP_DB_START, '1')
})

test('shouldEnsurePortlessProxy skips CI and PORTLESS bypass', () => {
  assert.equal(shouldEnsurePortlessProxy({ env: {} }), true)
  assert.equal(shouldEnsurePortlessProxy({ env: { CI: '1' } }), false)
  assert.equal(shouldEnsurePortlessProxy({ env: { PORTLESS: '0' } }), false)
  assert.equal(shouldEnsurePortlessProxy({ env: { PORTLESS: 'skip' } }), false)
})

test('portlessProxyPort defaults to 443', () => {
  assert.equal(portlessProxyPort({ env: {} }), 443)
  assert.equal(portlessProxyPort({ env: { PORTLESS_PORT: '1355' } }), 1355)
  assert.equal(portlessProxyPort({ env: { PORTLESS_PORT: 'nope' } }), 443)
})

test('ensurePortlessProxy does not spawn when the proxy is already up', async () => {
  const calls = []
  const result = await ensurePortlessProxy({
    env: {},
    log: { log() {}, error() {} },
    spawn: (...args) => {
      calls.push(args)
      return { status: 0 }
    },
    responding: async () => true,
  })
  assert.deepEqual(result, { ok: true, skipped: true })
  assert.equal(calls.length, 0)
})

test('ensurePortlessProxy starts the proxy once when it is down', async () => {
  let probes = 0
  const calls = []
  const result = await ensurePortlessProxy({
    env: {},
    log: { log() {}, error() {} },
    spawn: (cmd, args, options) => {
      calls.push({ cmd, args, options })
      return { status: 0 }
    },
    responding: async () => {
      probes += 1
      return probes > 1
    },
  })
  assert.deepEqual(result, { ok: true, skipped: false })
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].args, [
    'exec',
    'portless',
    'proxy',
    'start',
    '--https',
    '--port',
    '443',
    '--skip-trust',
  ])
})

test('ensurePortlessProxy fails when proxy start exits non-zero', async () => {
  const errors = []
  const result = await ensurePortlessProxy({
    env: {},
    log: { log() {}, error: msg => errors.push(msg) },
    spawn: () => ({ status: 1 }),
    responding: async () => false,
  })
  assert.equal(result.ok, false)
  assert.equal(result.status, 1)
  assert.match(errors.join('\n'), /Failed to start the Portless proxy/)
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
