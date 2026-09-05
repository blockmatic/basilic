import { existsSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRootFromPackage } from '../paths.js'
import { classifyPath, loadManifest } from './classify.js'
import { resetFirstInstance } from './first-reset.js'
import { agentReadPaths } from './index.js'
import { snapshotDocs } from './snapshot-docs.js'

describe('assembled agent reads', () => {
  it('keeps mandatory agent files in the classified tree', () => {
    const manifest = loadManifest()
    for (const path of agentReadPaths) {
      if (path.startsWith('docs/basilic/') || path === '_first/PRODUCT.md') continue
      expect(existsSync(join(repoRootFromPackage, path)), path).toBe(true)
      expect(classifyPath({ path, manifest })?.kind).not.toBe('exclude')
    }
  })

  it('snapshots at least the current docs page count', () => {
    const destRoot = join(tmpdir(), `create-basilic-docs-${Date.now()}`)
    const { pages } = snapshotDocs({ sourceRoot: repoRootFromPackage, destRoot })
    expect(pages).toBeGreaterThanOrEqual(40)
  })

  it('snapshots docs and writes an unfilled FIRST instance', async () => {
    const dest = await mkdtemp(join(tmpdir(), 'create-basilic-first-'))
    snapshotDocs({ sourceRoot: repoRootFromPackage, destRoot: dest })
    resetFirstInstance({ destRoot: dest })
    for (const path of agentReadPaths.filter(
      item => item.startsWith('_first/') || item.startsWith('docs/basilic/'),
    ))
      expect(existsSync(join(dest, path)), path).toBe(true)
    expect(existsSync(join(dest, '_first/basilic/PRODUCT.md'))).toBe(false)
  })
})
