import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pnpmVersionMatches } from './vercel-pnpm.mjs'

const pinned = '12.4.2'

function spawnStdout(stdout) {
  return () => ({ status: 0, stdout })
}

test('accepts the pinned pnpm version', () => {
  assert.equal(
    pnpmVersionMatches({
      cmd: 'pnpm',
      argsPrefix: [],
      env: {},
      version: pinned,
      spawn: spawnStdout(`${pinned}\n`),
    }),
    true,
  )
})

test('rejects a different major version', () => {
  assert.equal(
    pnpmVersionMatches({
      cmd: 'pnpm',
      argsPrefix: [],
      env: {},
      version: pinned,
      spawn: spawnStdout('9.0.0\n'),
    }),
    false,
  )
})
