#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dest = process.argv[2]
if (!dest) {
  console.error('Usage: assert-generated-tree.mjs <assembled-root>')
  process.exit(1)
}

const forbidden = [
  'apps/docu',
  'tools/create-basilic',
  'scripts/prepare-publish.mjs',
  'scripts/restore-publish.mjs',
  '_first/basilic',
  'release-please-config.json',
  '.release-please-manifest.json',
  '.github/workflows/release-please.yml',
  '.github/workflows/publish-create-basilic.yml',
  '.github/workflows/pr-title.yml',
  '.github/workflows/scaffold.yml',
  '.github/workflows/release-impact.yml',
  '.github/workflows/scaffold-acceptance.yml',
]

const required = [
  'AGENTS.md',
  'LICENSE',
  'package.json',
  'pnpm-lock.yaml',
  'apps/api/package.json',
  'apps/web/package.json',
  'apps/mobile/package.json',
  'packages/cli/package.json',
  'tools/eslint/package.json',
  'tools/typescript/package.json',
  '_first/FIRST.md',
  '_first/PRODUCT.md',
  'docs/basilic/development/index.md',
  'docs/basilic/testing/product-ready.md',
  '.cursor/rules/base/general.mdc',
  '.agents/skills/workflow/SKILL.md',
]

let failed = false
for (const path of forbidden) {
  if (existsSync(join(dest, path))) {
    console.error(`Forbidden path present: ${path}`)
    failed = true
  }
}
for (const path of required) {
  if (!existsSync(join(dest, path))) {
    console.error(`Required path missing: ${path}`)
    failed = true
  }
}

const turboRaw = readFileSync(join(dest, 'turbo.json'), 'utf8')
if (turboRaw.includes('@repo/docu#build')) {
  console.error('turbo.json still declares @repo/docu#build')
  failed = true
}

const license = readFileSync(join(dest, 'LICENSE'), 'utf8')
if (!license.includes('MIT')) {
  console.error('LICENSE is not MIT')
  failed = true
}

const pkg = JSON.parse(readFileSync(join(dest, 'package.json'), 'utf8'))
if (pkg.name === 'create-basilic') {
  console.error('assembled root package.json must not be the generator')
  failed = true
}

const workspace = readFileSync(join(dest, 'pnpm-workspace.yaml'), 'utf8')
if (
  !workspace.includes('apps/*') ||
  !workspace.includes('packages/*') ||
  !workspace.includes('tools/*')
) {
  console.error('pnpm-workspace.yaml is missing apps/*, packages/*, or tools/*')
  failed = true
}

const lockPath = join(dest, 'skills-lock.json')
if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  const local = Object.entries(lock.skills ?? {}).filter(
    ([, skill]) => skill.sourceType === 'local',
  )
  if (local.length > 0) {
    const names = local.map(([name]) => name).join(', ')
    console.error(`skills-lock.json still has local sources: ${names}`)
    failed = true
  }
}

process.exit(failed ? 1 : 0)
