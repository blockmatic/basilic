#!/usr/bin/env node
/**
 * Run QA pipeline: install (if needed), checktypes, lint, OpenAPI drift and lint,
 * sherif, build, test:scripts, test, e2e.
 * Knip stays in lint.yml only. Stops on the first failure.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)

const qaBuildEnv = process.env.JWT_SECRET
  ? undefined
  : { JWT_SECRET: 'qa-build-placeholder-min-32-chars-to-pass-validation' }

const hasNodeModules = existsSync(join(repoRoot, 'node_modules'))

const phases = [
  ...(hasNodeModules ? [] : [{ name: 'install', cmd: 'pnpm', args: ['i', '--frozen-lockfile'] }]),
  {
    name: 'checktypes',
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'checktypes', '--concurrency=100%'],
  },
  { name: 'lint', cmd: 'pnpm', args: ['lint'] },
  { name: 'openapi-drift', cmd: 'pnpm', args: ['openapi:drift'] },
  { name: 'openapi-lint', cmd: 'pnpm', args: ['openapi:lint'] },
  { name: 'sherif', cmd: 'pnpm', args: ['sherif'] },
  {
    name: 'build',
    cmd: 'pnpm',
    args: ['build'],
    env: { ...qaBuildEnv, NEXT_PUBLIC_API_URL: 'http://localhost:3001' },
  },
  {
    name: 'test:scripts',
    cmd: 'pnpm',
    args: ['test:scripts'],
  },
  {
    name: 'test',
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'test', '--concurrency=100%'],
  },
  {
    name: 'test:e2e',
    cmd: 'pnpm',
    args: ['test:e2e'],
    env: { SKIP_BUILD: '1', ...qaBuildEnv, NEXT_PUBLIC_API_URL: 'http://localhost:3001' },
  },
]

for (const { name, cmd, args, env } of phases) {
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...(env ?? {}) },
  })
  if (result.status !== 0) {
    const code = result.status ?? 1
    console.error('\n---\nQA FAILED at phase "%s" (exit code %d)\n---\n', name, code)
    process.exit(code)
  }
}
