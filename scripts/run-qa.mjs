#!/usr/bin/env node
/**
 * Run QA pipeline: install, checktypes, lint:fix, build, test, test:e2e.
 * Stops immediately on first failure and reports which phase failed.
 * Used by pnpm qa.
 */
import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)

const qaBuildEnv = process.env.JWT_SECRET
  ? undefined
  : { JWT_SECRET: 'qa-build-placeholder-min-32-chars-to-pass-validation' }

const skipTests = process.env.QA_SKIP_TESTS === '1' || process.env.QA_SKIP_TESTS === 'true'

const phases = [
  { name: 'install', cmd: 'pnpm', args: ['i', '--no-frozen-lockfile'] },
  {
    name: 'checktypes',
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'checktypes', '--concurrency=100%'],
  },
  { name: 'lint:fix', cmd: 'pnpm', args: ['lint:fix'] },
  { name: 'build', cmd: 'pnpm', args: ['build'], env: qaBuildEnv },
  ...(skipTests
    ? []
    : [
        { name: 'test', cmd: 'pnpm', args: ['exec', 'turbo', 'run', 'test', '--concurrency=100%'] },
        { name: 'test:e2e', cmd: 'pnpm', args: ['test:e2e'] },
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
