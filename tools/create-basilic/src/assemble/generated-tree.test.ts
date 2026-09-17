import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRootFromPackage } from '../paths.js'

describe('assert-generated-tree', () => {
  it('rejects leftover .agents/skills/b beside workflow', async () => {
    const dest = await mkdtemp(join(tmpdir(), 'assert-generated-tree-'))
    mkdirSync(join(dest, '.agents/skills/b'), { recursive: true })
    mkdirSync(join(dest, '.agents/skills/workflow'), { recursive: true })
    writeFileSync(join(dest, '.agents/skills/b/SKILL.md'), 'legacy\n')
    writeFileSync(join(dest, '.agents/skills/workflow/SKILL.md'), 'workflow\n')
    const result = spawnSync(
      'node',
      [join(repoRootFromPackage, 'scripts/assert-generated-tree.mjs'), dest],
      { encoding: 'utf8' },
    )
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Forbidden path present: .agents/skills/b')
  })

  it('rejects an unsupported GitHub catalog in skills-lock.json', async () => {
    const dest = await mkdtemp(join(tmpdir(), 'assert-generated-tree-lock-'))
    writeFileSync(
      join(dest, 'skills-lock.json'),
      `${JSON.stringify({
        version: 1,
        skills: {
          workflow: { source: 'blockmatic/basilic-skills', sourceType: 'github' },
          'grill-me': { source: 'mattpocock/skills', sourceType: 'github' },
          other: { source: 'resend/react-email', sourceType: 'github' },
        },
      })}\n`,
    )
    const result = spawnSync(
      'node',
      [join(repoRootFromPackage, 'scripts/assert-generated-tree.mjs'), dest],
      { encoding: 'utf8' },
    )
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('unsupported catalogs (resend/react-email)')
  })
})
