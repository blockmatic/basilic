#!/usr/bin/env node
/**
 * Daily local start: ensure Supabase Postgres is up, then Turbo TUI.
 * Schema and identity seed run on Fastify boot. Wipe remains `pnpm reset`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const turboDevConcurrency = '20'

export function envFlagIsTrue(value) {
  return value === '1' || value === 'true'
}

export function parseEnvFlag(text, key) {
  if (!text) return undefined
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    if (trimmed.slice(0, eq) !== key) continue
    let value = trimmed.slice(eq + 1)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1)
    return value
  }
}

export function shouldSkipDbStart({ env = process.env, apiEnvText } = {}) {
  return (
    envFlagIsTrue(env.SKIP_DB_START) ||
    envFlagIsTrue(env.PGLITE) ||
    envFlagIsTrue(parseEnvFlag(apiEnvText, 'PGLITE'))
  )
}

export function turboDevCommand({ extraArgs = [] } = {}) {
  return {
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'dev', `--concurrency=${turboDevConcurrency}`, ...extraArgs],
  }
}

function readApiEnvText() {
  const envPath = join(repoRoot, 'apps/api/.env')
  if (!existsSync(envPath)) return undefined
  return readFileSync(envPath, 'utf8')
}

function isMain() {
  const entry = process.argv[1]
  if (!entry) return false
  return fileURLToPath(import.meta.url) === resolve(entry)
}

function main() {
  if (!shouldSkipDbStart({ apiEnvText: readApiEnvText() })) {
    const db = spawnSync('pnpm', ['--filter', '@repo/db', 'db:start'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    if (db.status !== 0) {
      console.error(
        '\nFailed to start local Postgres. Start Docker Desktop, then run `pnpm db:start`.\nSet SKIP_DB_START=1 to skip (or PGLITE=true).\n',
      )
      process.exit(db.status ?? 1)
    }
  }

  const { cmd, args } = turboDevCommand({ extraArgs: process.argv.slice(2) })
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: 'inherit' })
  process.exit(result.status ?? 1)
}

if (isMain()) main()
