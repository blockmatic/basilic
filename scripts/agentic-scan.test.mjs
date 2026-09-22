#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const scanScript = join(scriptDir, 'agentic-scan.mjs')

describe('agentic-scan.mjs', () => {
  it('invokes is-agentic with host from AGENTIC_SCAN_URL', () => {
    const result = spawnSync(process.execPath, [scanScript], {
      cwd: repoRoot,
      env: {
        ...process.env,
        AGENTIC_SCAN_URL: 'https://example.test/api',
        PATH: process.env.PATH,
      },
      encoding: 'utf8',
    })

    assert.match(result.stderr + result.stdout, /is-agentic/)
    assert.match(result.stderr + result.stdout, /example\.test/)
  })
})
