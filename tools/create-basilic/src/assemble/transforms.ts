import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function applyAssembleTransforms({ destRoot }: { destRoot: string }) {
  dropDocuTurboTask({ destRoot })
  stripVercelMcp({ destRoot })
  placeholderDeepsec({ destRoot })
  dropDocuCoderabbitPath({ destRoot })
  rewriteLocalSkillSources({ destRoot })
}

function dropDocuTurboTask({ destRoot }: { destRoot: string }) {
  const path = join(destRoot, 'turbo.json')
  const turbo = JSON.parse(readFileSync(path, 'utf8')) as {
    tasks: Record<string, unknown>
  }
  delete turbo.tasks['@repo/docu#build']
  writeFileSync(path, `${JSON.stringify(turbo, null, 2)}\n`)
}

function stripVercelMcp({ destRoot }: { destRoot: string }) {
  const path = join(destRoot, '.cursor/mcp.json')
  if (!existsSync(path)) return
  const mcp = JSON.parse(readFileSync(path, 'utf8')) as {
    mcpServers: Record<string, { url?: string }>
  }
  for (const [name, server] of Object.entries(mcp.mcpServers))
    if (typeof server.url === 'string' && /basilic-(docu|fastify|next)/.test(server.url))
      delete mcp.mcpServers[name]
  writeFileSync(path, `${JSON.stringify(mcp, null, 2)}\n`)
}

function placeholderDeepsec({ destRoot }: { destRoot: string }) {
  const path = join(destRoot, '.deepsec/deepsec.config.ts')
  if (!existsSync(path)) return
  const source = readFileSync(path, 'utf8')
    .replace('id: "basilic"', 'id: "app"')
    .replace(
      'githubUrl: "https://github.com/blockmatic/basilic/blob/main"',
      'githubUrl: "https://github.com/example/app/blob/main"',
    )
  writeFileSync(path, source)
  const dataDir = join(destRoot, '.deepsec/data/basilic')
  if (existsSync(dataDir)) rmSync(dataDir, { recursive: true, force: true })
}

function dropDocuCoderabbitPath({ destRoot }: { destRoot: string }) {
  const path = join(destRoot, '.coderabbit.yaml')
  if (!existsSync(path)) return
  const source = readFileSync(path, 'utf8').replace(/^\s*- path: "apps\/docu\/\*\*"\n/m, '')
  writeFileSync(path, source)
}

function rewriteLocalSkillSources({ destRoot }: { destRoot: string }) {
  const path = join(destRoot, 'skills-lock.json')
  if (!existsSync(path)) return
  const lock = JSON.parse(readFileSync(path, 'utf8')) as {
    skills?: Record<string, { source?: string; sourceType?: string; skillPath?: string }>
  }
  for (const [name, skill] of Object.entries(lock.skills ?? {})) {
    if (skill.sourceType !== 'local') continue
    skill.source = 'blockmatic/basilic-skills'
    skill.sourceType = 'github'
    if (!skill.skillPath) skill.skillPath = `skills/${name}/SKILL.md`
  }
  writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`)
}
