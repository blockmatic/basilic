import { describe, expect, it } from 'vitest'
import { listTrackedFiles } from '../git.js'
import { repoRootFromPackage } from '../paths.js'
import { classifyPath, classifyTrackedFiles, loadManifest } from './classify.js'

describe('classifyPath', () => {
  const manifest = loadManifest()

  it('excludes the documentation app and generator', () => {
    expect(classifyPath({ path: 'apps/docu/package.json', manifest })?.kind).toBe('exclude')
    expect(classifyPath({ path: 'tools/create-basilic/src/cli.ts', manifest })?.kind).toBe(
      'exclude',
    )
  })

  it('includes portable tools and packages', () => {
    expect(classifyPath({ path: 'tools/eslint/package.json', manifest })?.kind).toBe('include')
    expect(classifyPath({ path: 'packages/core/src/index.ts', manifest })?.kind).toBe('include')
  })

  it('transforms agent and app surfaces', () => {
    expect(classifyPath({ path: 'AGENTS.md', manifest })?.kind).toBe('transform')
    expect(classifyPath({ path: 'apps/web/app/layout.tsx', manifest })?.kind).toBe('transform')
  })

  it('prefers exclude over a parent transform', () => {
    expect(classifyPath({ path: '_first/basilic/PRODUCT.md', manifest })?.kind).toBe('exclude')
    expect(classifyPath({ path: '_first/FIRST.md', manifest })?.kind).toBe('transform')
  })

  it('excludes release automation', () => {
    expect(classifyPath({ path: 'release-please-config.json', manifest })?.kind).toBe('exclude')
    expect(classifyPath({ path: '.github/workflows/release-please.yml', manifest })?.kind).toBe(
      'exclude',
    )
    expect(
      classifyPath({ path: '.github/workflows/publish-create-basilic.yml', manifest })?.kind,
    ).toBe('exclude')
    expect(classifyPath({ path: 'scripts/prepare-publish.mjs', manifest })?.kind).toBe('exclude')
    expect(classifyPath({ path: 'CHANGELOG.md', manifest })?.kind).toBe('exclude')
  })
})

describe('classification completeness', () => {
  it('classifies every tracked git path', () => {
    const manifest = loadManifest()
    const files = listTrackedFiles({ repoRoot: repoRootFromPackage })
    const { unclassified } = classifyTrackedFiles({ files, manifest })
    expect(unclassified, unclassified.join('\n')).toEqual([])
  })
})
