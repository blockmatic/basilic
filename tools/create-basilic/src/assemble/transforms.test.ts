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
          'w-plan': { source: '../basilic-skills', sourceType: 'local' },
          f: { source: 'blockmatic/first', sourceType: 'github' },
        },
      }),
    )
    writeFileSync(
      join(destRoot, 'portless.json'),
      JSON.stringify({
        apps: {
          'apps/web': { name: 'basilic', script: 'dev:app' },
          'apps/docu': { name: 'docu.basilic', script: 'dev:app' },
          'apps/agents': { name: 'agents.basilic', script: 'dev:app' },
        },
      }),
    )
    applyAssembleTransforms({ destRoot })
    const lock = JSON.parse(readFileSync(join(destRoot, 'skills-lock.json'), 'utf8')) as {
      skills: { 'w-plan': { source: string; sourceType: string; skillPath: string }; f?: unknown }
    }
    expect(lock.skills['w-plan'].source).toBe('blockmatic/basilic-skills')
    expect(lock.skills['w-plan'].sourceType).toBe('github')
    expect(lock.skills['w-plan'].skillPath).toBe('skills/w-plan/SKILL.md')
    expect(lock.skills.f).toBeUndefined()
    const portless = JSON.parse(readFileSync(join(destRoot, 'portless.json'), 'utf8')) as {
      apps: Record<string, unknown>
    }
    expect(portless.apps['apps/web']).toEqual({ name: 'basilic', script: 'dev:app' })
    expect(portless.apps['apps/docu']).toBeUndefined()
    expect(portless.apps['apps/agents']).toBeUndefined()
  })
})
