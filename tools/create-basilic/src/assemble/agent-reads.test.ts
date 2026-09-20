import { existsSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRootFromPackage } from '../paths.js'
import { classifyPath, loadManifest } from './classify.js'
import { agentReadPaths } from './index.js'
import { resetProductBrief } from './product-reset.js'
import { snapshotDocs } from './snapshot-docs.js'

describe('assembled agent reads', () => {
  it('keeps mandatory agent files in the classified tree', () => {
    const manifest = loadManifest()
    for (const path of agentReadPaths) {
      if (path.startsWith('docs/basilic/')) continue
      expect(existsSync(join(repoRootFromPackage, path)), path).toBe(true)
      expect(classifyPath({ path, manifest })?.kind).not.toBe('exclude')
    }
  })

  it('snapshots at least the current docs page count', () => {
    const destRoot = join(tmpdir(), `create-basilic-docs-${Date.now()}`)
    const { pages } = snapshotDocs({ sourceRoot: repoRootFromPackage, destRoot })
    expect(pages).toBeGreaterThanOrEqual(40)
  })

  it('snapshots docs and strips FIRST extras', async () => {
    const dest = await mkdtemp(join(tmpdir(), 'create-basilic-product-'))
    snapshotDocs({ sourceRoot: repoRootFromPackage, destRoot: dest })
    resetProductBrief({ destRoot: dest })
    for (const path of agentReadPaths.filter(item => item.startsWith('docs/basilic/')))
      expect(existsSync(join(dest, path)), path).toBe(true)
    expect(existsSync(join(dest, 'PRODUCT.md'))).toBe(false)
    expect(existsSync(join(dest, '_first'))).toBe(false)
  })
})
