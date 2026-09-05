import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { IoError } from './copy.js'
import { generateProject } from './generate.js'

async function miniTemplate() {
  const root = await mkdtemp(join(tmpdir(), 'create-basilic-template-'))
  writeFileSync(join(root, 'package.json'), '{"name":"basilic","private":true}\n')
  writeFileSync(join(root, '.basilic-template.json'), '{"sourceSha":"abc","digest":"def"}\n')
  mkdirSync(join(root, 'apps/web/app/auth/login'), { recursive: true })
  writeFileSync(
    join(root, 'apps/web/app/auth/login/login-form.tsx'),
    '<h1>Welcome to Basilic</h1>\n',
  )
  return root
}

describe('generateProject', () => {
  it('creates a named project in a path with spaces', async () => {
    const templateRoot = await miniTemplate()
    const parent = await mkdtemp(join(tmpdir(), 'create-basilic-out-'))
    const directory = join(parent, 'My App')
    const result = await generateProject({
      directory,
      yes: true,
      templateRoot,
      generatorVersion: '0.0.0-test',
    })
    expect(result.name.slug).toBe('my-app')
    const pkg = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')) as {
      name: string
      basilic: { generatorVersion: string; templateDigest: string }
    }
    expect(pkg.name).toBe('my-app')
    expect(pkg.basilic.generatorVersion).toBe('0.0.0-test')
    expect(pkg.basilic.templateDigest).toBe('def')
    expect(readFileSync(join(directory, 'README.md'), 'utf8')).toContain('My App')
    expect(
      readFileSync(join(directory, 'apps/web/app/auth/login/login-form.tsx'), 'utf8'),
    ).toContain('Welcome to My App')
  })

  it('refuses a non-empty destination', async () => {
    const templateRoot = await miniTemplate()
    const dest = await mkdtemp(join(tmpdir(), 'create-basilic-existing-'))
    writeFileSync(join(dest, 'stale.txt'), 'nope')
    await expect(
      generateProject({
        directory: dest,
        templateRoot,
        generatorVersion: '0.0.0-test',
      }),
    ).rejects.toThrow(IoError)
  })

  it('refuses a missing bundled template', async () => {
    const dest = join(await mkdtemp(join(tmpdir(), 'create-basilic-missing-')), 'app')
    await expect(
      generateProject({
        directory: dest,
        templateRoot: await mkdtemp(join(tmpdir(), 'create-basilic-empty-')),
        generatorVersion: '0.0.0-test',
      }),
    ).rejects.toThrow(/Bundled template is missing/)
  })
})
