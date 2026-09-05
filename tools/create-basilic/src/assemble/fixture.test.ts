import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyPath, loadManifest } from './classify.js'
import { resetFirstInstance } from './first-reset.js'

const sentinelPaths = [
  ['LICENSE', 'include'],
  ['package.json', 'transform'],
  ['pnpm-lock.yaml', 'include'],
  ['AGENTS.md', 'transform'],
  ['apps/api/package.json', 'transform'],
  ['apps/web/package.json', 'transform'],
  ['apps/mobile/app.json', 'transform'],
  ['apps/docu/package.json', 'exclude'],
  ['packages/cli/package.json', 'transform'],
  ['tools/eslint/package.json', 'include'],
  ['tools/typescript/package.json', 'include'],
  ['tools/create-basilic/package.json', 'exclude'],
  ['_first/FIRST.md', 'transform'],
  ['_first/basilic/PRODUCT.md', 'exclude'],
  ['scripts/run-qa.mjs', 'transform'],
  ['scripts/prepare-publish.mjs', 'exclude'],
  ['release-please-config.json', 'exclude'],
  ['.github/workflows/lint.yml', 'transform'],
  ['.github/workflows/release-please.yml', 'exclude'],
  ['.github/workflows/publish-create-basilic.yml', 'exclude'],
  ['CHANGELOG.md', 'exclude'],
] as const

function sha256(value: Buffer) {
  return createHash('sha256').update(value).digest('hex')
}

describe('exact-version fixture', () => {
  it('pins include/transform/exclude prefixes', () => {
    const manifest = loadManifest()
    expect(manifest).toEqual({
      exclude: [
        'apps/docu/',
        'tools/create-basilic/',
        'scripts/prepare-publish.mjs',
        'scripts/restore-publish.mjs',
        'scripts/release-impact.mjs',
        'scripts/assert-generated-tree.mjs',
        '_first/basilic/',
        '_first/templates/',
        '.github/workflows/pr-title.yml',
        '.github/workflows/scaffold.yml',
        '.github/workflows/release-please.yml',
        '.github/workflows/publish-create-basilic.yml',
        '.github/workflows/release-impact.yml',
        '.github/workflows/scaffold-acceptance.yml',
        '.github/PULL_REQUEST_TEMPLATE.md',
        'release-please-config.json',
        '.release-please-manifest.json',
        'CHANGELOG.md',
        '__dev/',
      ],
      transform: [
        'package.json',
        'README.md',
        'AGENTS.md',
        'CLAUDE.md',
        'turbo.json',
        'skills-lock.json',
        '.coderabbit.yaml',
        '.cursor/',
        '.agents/',
        '_first/',
        '.deepsec/',
        'scripts/run-qa.mjs',
        'scripts/README.md',
        'apps/api/',
        'apps/web/',
        'apps/mobile/',
        'packages/cli/',
        '.github/workflows/',
      ],
      include: [
        'apps/api/',
        'apps/web/',
        'apps/mobile/',
        'packages/',
        'tools/eslint/',
        'tools/typescript/',
        'scripts/',
        '.github/',
        '.cursor/',
        '.agents/',
        '.deepsec/',
        '_first/',
        '.vscode/',
        'AGENTS.md',
        'CLAUDE.md',
        'LICENSE',
        'README.md',
        'biome.json',
        'eslint.config.mjs',
        'osv-scanner.toml',
        'package.json',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'skills-lock.json',
        'tsconfig.json',
        'turbo.json',
        '.gitignore',
        '.gitleaks.toml',
        '.node-version',
        '.nvmrc',
        '.trufflehogignore',
        '.coderabbit.yaml',
      ],
    })
  })

  it('pins classification of key paths', () => {
    const manifest = loadManifest()
    expect(
      sentinelPaths.map(([path, kind]) => ({
        path,
        kind: classifyPath({ path, manifest })?.kind,
        expected: kind,
      })),
    ).toEqual(sentinelPaths.map(([path, kind]) => ({ path, kind, expected: kind })))
  })

  it('pins hashes of generated FIRST shells', async () => {
    const destRoot = await mkdtemp(join(tmpdir(), 'create-basilic-fixture-'))
    resetFirstInstance({ destRoot })
    expect(sha256(readFileSync(join(destRoot, '_first/FIRST.md')))).toBe(
      'aaf6bb69aee5fbae5a20436d42dd3fbc34867db9ecf8e0b2bbd309a1b9fdb782',
    )
    expect(sha256(readFileSync(join(destRoot, '_first/PRODUCT.md')))).toBe(
      'ba8b11a8e9bef37aab1f835af3eb0824126a088e92420f6814273b5b2d39f766',
    )
  })
})
