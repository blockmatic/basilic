import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
    mkdirSync(join(destRoot, '.cursor'), { recursive: true })
    writeFileSync(
      join(destRoot, '.cursor/mcp.json'),
      `${JSON.stringify(
        {
          mcpServers: {
            github: { command: 'npx', args: ['@modelcontextprotocol/server-github'] },
            docu: { url: 'https://mcp.vercel.com/gaboesquivel/basilic-docu' },
            fastify: { url: 'https://mcp.vercel.com/gaboesquivel/basilic-fastify' },
            next: { url: 'https://mcp.vercel.com/gaboesquivel/basilic-next' },
            agents: { url: 'https://mcp.vercel.com/gaboesquivel/basilic-agents' },
          },
        },
        null,
        2,
      )}\n`,
    )
    applyAssembleTransforms({ destRoot })
    const lock = JSON.parse(readFileSync(join(destRoot, 'skills-lock.json'), 'utf8')) as {
      skills: { workflow: { source: string; sourceType: string; skillPath: string }; f?: unknown }
    }
    expect(lock.skills.workflow.source).toBe('blockmatic/basilic-skills')
    expect(lock.skills.workflow.sourceType).toBe('github')
    expect(lock.skills.workflow.skillPath).toBe('skills/workflow/SKILL.md')
    expect(lock.skills.f).toBeUndefined()
    const portless = JSON.parse(readFileSync(join(destRoot, 'portless.json'), 'utf8')) as {
      apps: Record<string, unknown>
    }
    expect(portless.apps['apps/web']).toEqual({ name: 'basilic', script: 'dev:app' })
    expect(portless.apps['apps/docu']).toBeUndefined()
    expect(portless.apps['apps/agents']).toBeUndefined()
    const mcp = JSON.parse(readFileSync(join(destRoot, '.cursor/mcp.json'), 'utf8')) as {
      mcpServers: Record<string, unknown>
    }
    expect(mcp.mcpServers.github).toBeDefined()
    expect(mcp.mcpServers.docu).toBeUndefined()
    expect(mcp.mcpServers.fastify).toBeUndefined()
    expect(mcp.mcpServers.next).toBeUndefined()
    expect(mcp.mcpServers.agents).toBeUndefined()
  })
})
