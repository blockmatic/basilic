import { readFileSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyAssembleTransforms } from './transforms.js'

describe('applyAssembleTransforms', () => {
  it('rewrites local skills-lock sources to GitHub', async () => {
    const destRoot = await mkdtemp(join(tmpdir(), 'create-basilic-lock-'))
    writeFileSync(join(destRoot, 'turbo.json'), '{"tasks":{"@repo/docu#build":{}}}\n')
    writeFileSync(
      join(destRoot, 'skills-lock.json'),
      JSON.stringify({
        version: 1,
        skills: {
          workflow: { source: '../basilic-skills', sourceType: 'local' },
        },
      }),
    )
    applyAssembleTransforms({ destRoot })
    const lock = JSON.parse(readFileSync(join(destRoot, 'skills-lock.json'), 'utf8')) as {
      skills: { workflow: { source: string; sourceType: string; skillPath: string } }
    }
    expect(lock.skills.workflow.source).toBe('blockmatic/basilic-skills')
    expect(lock.skills.workflow.sourceType).toBe('github')
    expect(lock.skills.workflow.skillPath).toBe('skills/workflow/SKILL.md')
  })
})
