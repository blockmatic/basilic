#!/usr/bin/env node
/**
 * Regenerate OpenAPI + clients, then fail if committed artifacts drift.
 * Mirrors api-e2e.yml (including untracked gen files).
 */
import { spawnSync } from 'node:child_process'
import { defaultE2eJwt, loadEnvTest, repoRoot } from './e2e-local-shared.mjs'

const loaded = loadEnvTest()
const jwtSecret = loaded.JWT_SECRET ?? process.env.JWT_SECRET ?? defaultE2eJwt
const qaBuildEnv = { JWT_SECRET: jwtSecret }

const generate = spawnSync('pnpm', ['generate'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: { ...process.env, ...qaBuildEnv },
})
if (generate.status !== 0) process.exit(generate.status ?? 1)

const diff = spawnSync(
  'git',
  [
    'diff',
    '--exit-code',
    '--',
    'apps/api/openapi/openapi.json',
    'packages/core/src/gen',
    'packages/core/src/api-wrapper.gen.ts',
    'packages/core/src/api-client.gen.ts',
    'packages/cli/src/gen',
  ],
  { cwd: repoRoot, stdio: 'inherit' },
)
if (diff.status !== 0) process.exit(diff.status ?? 1)

const status = spawnSync(
  'git',
  [
    'status',
    '--short',
    '--untracked-files=all',
    '--',
    'packages/core/src/gen',
    'packages/cli/src/gen',
  ],
  { cwd: repoRoot, encoding: 'utf8' },
)
if (status.status !== 0) process.exit(status.status ?? 1)
if (status.stdout.trim()) {
  console.error(status.stdout)
  process.exit(1)
}

console.log('OpenAPI artifacts match generated output.')
