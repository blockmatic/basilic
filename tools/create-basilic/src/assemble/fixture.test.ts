import { existsSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyPath, loadManifest } from './classify.js'
import { resetProductBrief } from './product-reset.js'

const sentinelPaths = [
  ['LICENSE', 'include'],
  ['package.json', 'transform'],
  ['pnpm-lock.yaml', 'include'],
  ['AGENTS.md', 'transform'],
  ['DESIGN.md', 'transform'],
  ['apps/api/package.json', 'transform'],
  ['apps/web/package.json', 'transform'],
  ['apps/mobile/app.json', 'transform'],
  ['apps/docu/package.json', 'exclude'],
  ['apps/agents/package.json', 'exclude'],
  ['packages/cli/package.json', 'transform'],
  ['tools/eslint/package.json', 'include'],
  ['tools/typescript/package.json', 'include'],
  ['tools/create-basilic/package.json', 'exclude'],
  ['_first/FIRST.md', 'exclude'],
  ['.agents/skills/f/SKILL.md', 'exclude'],
  ['scripts/run-qa.mjs', 'transform'],
  ['scripts/prepare-publish.mjs', 'exclude'],
  ['release-please-config.json', 'exclude'],
  ['.github/workflows/lint.yml', 'transform'],
  ['.github/workflows/release-please.yml', 'exclude'],
  ['.github/workflows/publish-create-basilic.yml', 'exclude'],
  ['CHANGELOG.md', 'exclude'],
] as const

describe('exact-version fixture', () => {
  it('pins include/transform/exclude prefixes', () => {
    const manifest = loadManifest()
    expect(manifest).toEqual({
      exclude: [
        'apps/docu/',
        'apps/agents/',
        'tools/create-basilic/',
        'scripts/prepare-publish.mjs',
        'scripts/restore-publish.mjs',
        'scripts/release-impact.mjs',
        'scripts/assert-generated-tree.mjs',
        '_first/',
        '.agents/skills/f/',
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
        'turbo.json',
        'portless.json',
        'skills-lock.json',
        '.coderabbit.yaml',
        '.cursor/',
        '.agents/',
        '.deepsec/',
        'DESIGN.md',
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
        '.vscode/',
        'DESIGN.md',
        'AGENTS.md',
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
        'portless.json',
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

  it('strips FIRST extras and does not write PRODUCT.md', async () => {
    const destRoot = await mkdtemp(join(tmpdir(), 'create-basilic-fixture-'))
    resetProductBrief({ destRoot })
    expect(existsSync(join(destRoot, 'PRODUCT.md'))).toBe(false)
    expect(existsSync(join(destRoot, '_first'))).toBe(false)
  })
})
