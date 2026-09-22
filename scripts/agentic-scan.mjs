#!/usr/bin/env node
/**
 * Run is-agentic against a public API host (operator tool; not a required CI check).
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)

const defaultUrl = 'https://basilic-fastify.vercel.app'
const target = process.env.AGENTIC_SCAN_URL?.trim() || defaultUrl

const host = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

const result = spawnSync('pnpm', ['exec', 'is-agentic', host, '--json'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
