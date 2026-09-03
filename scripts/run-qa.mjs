#!/usr/bin/env node
/**
 * Run QA pipeline: install (if needed), checktypes, lint, OpenAPI drift, build, test, e2e.
 * Stops immediately on first failure and reports which phase failed.
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

const skipTests = process.env.QA_SKIP_TESTS === '1' || process.env.QA_SKIP_TESTS === 'true'
const hasNodeModules = existsSync(join(repoRoot, 'node_modules'))

const phases = [
  ...(hasNodeModules ? [] : [{ name: 'install', cmd: 'pnpm', args: ['i', '--frozen-lockfile'] }]),
  {
    name: 'checktypes',
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'checktypes', '--concurrency=100%'],
  },
  { name: 'lint', cmd: 'pnpm', args: ['lint'] },
  {
    name: 'openapi-drift',
    cmd: 'pnpm',
    args: ['generate'],
    env: qaBuildEnv,
  },
  {
    name: 'openapi-drift-check',
    cmd: 'git',
    args: ['diff', '--exit-code', '--', 'apps/api/openapi/openapi.json', 'packages/core/src/gen'],
  },
  { name: 'build', cmd: 'pnpm', args: ['build'], env: qaBuildEnv },
  ...(skipTests
    ? []
    : [
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
      ]),
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
