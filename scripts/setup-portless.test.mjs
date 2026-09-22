import assert from 'node:assert/strict'
import { test } from 'node:test'

import { envFlagIsTrue, main } from './setup-portless.mjs'

test('envFlagIsTrue matches setup skip rules', () => {
  assert.equal(envFlagIsTrue('1'), true)
  assert.equal(envFlagIsTrue('true'), true)
  assert.equal(envFlagIsTrue('0'), false)
})

test('setup:portless is a no-op in CI', () => {
  const lines = []
  const status = main({
    env: { CI: '1' },
    log: { log: msg => lines.push(String(msg)), error: () => {} },
  })
  assert.equal(status, 0)
  assert.match(lines.join('\n'), /skipped \(CI=1\)/)
})
