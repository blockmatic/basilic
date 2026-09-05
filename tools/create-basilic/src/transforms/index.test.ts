import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyProjectTransforms } from './index.js'

describe('applyProjectTransforms', () => {
  it('rewrites audited display strings and the mobile scheme', () => {
    const root = join(tmpdir(), `create-basilic-xform-${Date.now()}`)
    mkdirSync(join(root, 'apps/web/app/auth/login'), { recursive: true })
    mkdirSync(join(root, 'apps/mobile/.maestro/flows'), { recursive: true })
    writeFileSync(join(root, 'package.json'), '{"name":"basilic","private":true}\n')
    writeFileSync(
      join(root, 'apps/web/app/auth/login/login-form.tsx'),
      '<h1>Welcome to Basilic</h1>\n',
    )
    writeFileSync(
      join(root, 'apps/mobile/app.json'),
      '{"expo":{"scheme":"com.blockmatic.basilic"}}\n',
    )
    writeFileSync(
      join(root, 'apps/mobile/.maestro/flows/home.yml'),
      'appId: com.blockmatic.basilic\n',
    )
    writeFileSync(
      join(root, 'apps/web/next.config.mjs'),
      "const apiProjectName = 'basilic-fastify'\nconst teamSlug = 'gaboesquivel'\n",
    )

    applyProjectTransforms({
      destRoot: root,
      name: { slug: 'acme', displayName: 'Acme', packageName: 'acme' },
    })

    expect(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name).toBe('acme')
    expect(readFileSync(join(root, 'apps/web/app/auth/login/login-form.tsx'), 'utf8')).toContain(
      'Welcome to Acme',
    )
    expect(readFileSync(join(root, 'apps/mobile/app.json'), 'utf8')).toContain('com.example.acme')
    expect(readFileSync(join(root, 'apps/web/next.config.mjs'), 'utf8')).toContain("'acme-api'")
    expect(readFileSync(join(root, 'apps/web/next.config.mjs'), 'utf8')).not.toContain(
      'gaboesquivel',
    )
  })
})
