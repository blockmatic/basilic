import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { packageRoot } from './paths.js'

const runPack = process.env.CREATE_BASILIC_PACK_TEST === '1'

describe.skipIf(!runPack)('npm pack outside the workspace', () => {
  it('packs and generates from the extracted tarball', () => {
    const work = mkdtempSync(join(tmpdir(), 'create-basilic-pack-'))
    const pack = spawnSync('npm', ['pack', '--pack-destination', work], {
      cwd: packageRoot,
      encoding: 'utf8',
    })
    expect(pack.status, pack.stderr).toBe(0)
    const tarball = pack.stdout.trim().split('\n').at(-1)
    expect(tarball).toBeTruthy()
    const tarballPath = join(work, tarball ?? '')
    expect(existsSync(tarballPath)).toBe(true)

    const extracted = join(work, 'extracted')
    mkdirSync(extracted)
    const untar = spawnSync('tar', ['-xzf', tarballPath, '-C', extracted], { encoding: 'utf8' })
    expect(untar.status, untar.stderr).toBe(0)
    const packedRoot = join(extracted, 'package')
    expect(existsSync(join(packedRoot, 'dist/cli.js'))).toBe(true)
    expect(existsSync(join(packedRoot, 'template/package.json'))).toBe(true)

    const dest = join(work, 'from-tarball')
    const generate = spawnSync('node', [join(packedRoot, 'dist/cli.js'), dest, '--yes'], {
      encoding: 'utf8',
    })
    expect(generate.status, generate.stderr).toBe(0)
    expect(existsSync(join(dest, 'package.json'))).toBe(true)
    expect(existsSync(join(dest, 'apps/docu'))).toBe(false)
    expect(existsSync(join(dest, 'tools/create-basilic'))).toBe(false)
    rmSync(work, { recursive: true, force: true })
  })
})
