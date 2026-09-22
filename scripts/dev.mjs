#!/usr/bin/env node
/**
 * Daily local start: ensure Supabase Postgres is up, then Turbo TUI.
 * Schema and identity seed run on Fastify boot. Wipe remains `pnpm reset`.
 * HTTP apps are reached via Portless https://*.localhost names, not bind ports.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatLocalUrlBanner, localDevChildEnv, resolveLocalAppUrls } from './local-urls.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const turboDevConcurrency = '20'

export function envFlagIsTrue(value) {
  return value === '1' || value === 'true'
}

export function turboChildEnv({ env = process.env, urls } = {}) {
  return { ...localDevChildEnv({ env, ...(urls ? { urls } : {}) }), SKIP_DB_START: '1' }
}

export function turboDevCommand({ extraArgs = [] } = {}) {
  return {
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'dev', `--concurrency=${turboDevConcurrency}`, ...extraArgs],
  }
}

function isMain() {
  const entry = process.argv[1]
  if (!entry) return false
  return fileURLToPath(import.meta.url) === resolve(entry)
}

function main() {
  if (!envFlagIsTrue(process.env.SKIP_DB_START)) {
    const db = spawnSync('pnpm', ['--filter', '@repo/db', 'db:start'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    if (db.status !== 0) {
      console.error(
        '\nFailed to start local Postgres. Start Docker Desktop, then run `pnpm db:start`.\nSet SKIP_DB_START=1 to skip.\n',
      )
      process.exit(db.status ?? 1)
    }
  }

  const urls = resolveLocalAppUrls({ cwd: repoRoot })
  console.log(`\n${formatLocalUrlBanner({ urls })}\n`)

  const { cmd, args } = turboDevCommand({ extraArgs: process.argv.slice(2) })
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: turboChildEnv({ urls }),
  })
  process.exit(result.status ?? 1)
}

if (isMain()) main()
