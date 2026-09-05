#!/usr/bin/env node
/**
 * Fail when starter payload paths change behind a non-releasing PR title.
 * Skip with `skip-release: true` in the PR body after review.
 */
import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))

const payloadPrefixes = [
  'apps/api/',
  'apps/web/',
  'apps/mobile/',
  'packages/',
  'tools/eslint/',
  'tools/typescript/',
  'tools/create-basilic/',
  'scripts/',
  '.cursor/',
  '.agents/',
  '.github/actions/',
  'AGENTS.md',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
  'biome.json',
  'eslint.config.mjs',
]

const nonReleasing = /^(docs|chore|test|ci|style)(\(.+\))?:/

const title = process.env.PR_TITLE ?? ''
const body = process.env.PR_BODY ?? ''
const base = process.env.PR_BASE_SHA ?? 'origin/main'
const head = process.env.PR_HEAD_SHA ?? 'HEAD'

if (/skip-release:\s*true/i.test(body) || /Release-As:/i.test(body)) {
  console.log('Release-impact: skip-release or Release-As present; allowing non-releasing title.')
  process.exit(0)
}

if (!nonReleasing.test(title.trim())) {
  console.log('Release-impact: title is release-bearing or unclassified; ok.')
  process.exit(0)
}

const diff = spawnSync('git', ['diff', '--name-only', `${base}...${head}`], {
  cwd: repoRoot,
  encoding: 'utf8',
})
if (diff.status !== 0) {
  console.error(diff.stderr || 'git diff failed')
  process.exit(1)
}

const changed = diff.stdout.split('\n').filter(Boolean)
const payload = changed.filter(path =>
  payloadPrefixes.some(prefix => path === prefix.replace(/\/$/, '') || path.startsWith(prefix)),
)

if (payload.length === 0) {
  console.log('Release-impact: no payload paths; ok.')
  process.exit(0)
}

console.error(
  `Release-impact: payload paths changed with non-releasing title "${title}".\n` +
    'Use feat/fix/perf (or BREAKING CHANGE) or add `skip-release: true` to the PR body after review.\n\n' +
    payload.join('\n'),
)
process.exit(1)
